import * as drive from '@googleapis/drive'
import fs, { constants } from 'fs/promises'
import cron from 'node-cron'
import path from 'path'
import sharp from 'sharp'
import config from './config'

const getPhotos = async () => {
  try {
    const auth = new drive.auth.GoogleAuth({
      keyFile: config.credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    })

    const client = drive.drive({ version: 'v3', auth })
    const files = await client.files.list({ fields: 'files/id,files/name,files/fileExtension' })
    if (files.data.files == undefined) return

    await Promise.all(files.data.files
      .filter(file => config.imageExts.includes(`.${file.fileExtension}`))
      .map(async (file) => {
        const filename = path.join(config.imageDir, path.basename(file.name!, '.jpg'))
        const exists = await fs.access(filename, constants.F_OK).then(() => true).catch(() => false)
        if (exists) return

        const download = await client.files.get({ fileId: file.id!, alt: 'media' })
        const data = download.data as unknown as Blob

        await fs.mkdir(config.imageDir, { recursive: true })
        await sharp(await data.arrayBuffer()).resize(800, 480).jpeg().toFile(filename)
      })
    )
  } catch (e) {
    console.error(e)
  }
}

cron.schedule('*/5 * * * *', getPhotos)
