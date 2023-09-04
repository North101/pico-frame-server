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

const formatImageName = (fileId: string) => `${fileId}.jpg`

const listDriveImages = async (client: drive.drive_v3.Drive, nextPageToken?: string): Promise<string[]> => {
  const result = await client.files.list({ q: query, pageToken: nextPageToken })
  if (result.data.files == undefined) return []

  const files = [
    ...result.data.files.map(file => file.id).filter((e): e is string => e != undefined),
  ]
  if (result.data.nextPageToken) {
    files.push(...await listDriveImages(client, result.data.nextPageToken))
  }
  return files
}

const downloadDriveImage = async (client: drive.drive_v3.Drive, fileId: string) => {
  const filename = path.join(config.imageDir, formatImageName(fileId))
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
      width: config.imageWidth,
      height: config.imageHeight,
    })
    .jpeg()
    .toFile(filename)
}

const getPhotos = async () => {
  try {
    const auth = new drive.auth.GoogleAuth({
      keyFile: config.credentials,
      scopes,
    })
    const client = drive.drive({ version: 'v3', auth })
    const fileIds = await listDriveImages(client)
    await Promise.all(fileIds.map((fileId) => downloadDriveImage(client, fileId)))
  } catch (e) {
    console.error(e)
  }
}

cron.schedule('*/5 * * * *', getPhotos, {
  runOnInit: true,
})
