import * as drive from '@googleapis/drive'
import fs, { constants } from 'fs/promises'
import cron from 'node-cron'
import path from 'path'
import sharp from 'sharp'
import config from './config'

const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
]

const queryMimeTypes = config.imageMimeTypes
  ?.filter(mimeType => mimeType)
  .map(mimeType => `mimeType = '${mimeType}'`)
  .join(' or ')

const queryFolderIds = config.folderIds
  ?.filter(folderId => folderId)
  .map(folderId => `'${folderId}' in parents`)
  .join(' or ')

const query = [queryMimeTypes, queryFolderIds,]
  .filter(e => e)
  .map(e => `(${e})`)
  .join(' and ')

const exists = async (filename: string) => {
  return fs.access(filename, constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

const getPhotos = async () => {
  try {
    const auth = new drive.auth.GoogleAuth({
      keyFile: config.credentials,
      scopes,
    })

    const client = drive.drive({ version: 'v3', auth })
    const files = await client.files.list({ q: query })
    if (files.data.files == undefined) return

    const tasks = files.data.files
      .map(async (file) => {
        const fileId = file.id
        if (fileId == undefined) return

        const filename = path.join(config.imageDir, `${fileId}.jpg`)
        if (await exists(filename)) return

        const download = await client.files.get(
          { fileId: fileId, alt: 'media' },
          { responseType: 'arraybuffer' },
        )
        const image = download.data as unknown as ArrayBuffer

        await fs.mkdir(config.imageDir, { recursive: true })
        await sharp(image)
          .resize({
            position: 'entropy',
            width: 800,
            height: 480,
          })
          .jpeg()
          .toFile(filename)
      })
    await Promise.all(tasks)
  } catch (e) {
    console.error(e)
  }
}

cron.schedule('*/5 * * * *', getPhotos, {
  runOnInit: true,
})
