import * as drive from '@googleapis/drive'
import fs, { constants } from 'fs/promises'
import cron from 'node-cron'
import sharp from 'sharp'
import config from './config'
import { fullImagePath, listServerImages } from './util'

const scopes = [
  'https://www.googleapis.com/auth/drive.readonly',
]

const queryMimeTypes = config.drive.mimeTypes
  .filter(mimeType => mimeType)
  .map(mimeType => `mimeType = '${mimeType}'`)
  .join(' or ')

const queryFolderIds = config.drive.folderIds
  .filter(folderId => folderId)
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

const transcodeImage = async (image: ArrayBuffer, filename: string) => {
  await fs.mkdir(config.image.dir, { recursive: true })
  await sharp(image)
    .resize({
      position: 'entropy',
      width: config.image.width,
      height: config.image.height,
    })
    .jpeg()
    .toFile(filename)
}

const downloadDriveImage = async (client: drive.drive_v3.Drive, fileId: string) => {
  const download = await client.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' },
  )
  const image = download.data as unknown as ArrayBuffer
  await transcodeImage(image, fullImagePath(formatImageName(fileId)))
}

const syncAddedDriveImages = async (client: drive.drive_v3.Drive, fileIds: string[], serverImages: string[]) => {
  return await Promise.all(fileIds
    .filter(fileId => !serverImages.includes(formatImageName(fileId)))
    .map((fileId) => downloadDriveImage(client, fileId))
  )
}

const deleteImage = (image: string) => fs.rm(fullImagePath(image))

const syncRemovedDriveImages = async (fileIds: string[], serverImages: string[]) => {
  const driveImages = fileIds.map(formatImageName)
  return await Promise.all(serverImages
    .filter(image => !driveImages.includes(image))
    .map(deleteImage)
  )
}

const syncDriveImages = async () => {
  try {
    console.log('Syncing Drive Images')
    const auth = new drive.auth.GoogleAuth({
      keyFile: config.drive.credentials,
      scopes,
    })
    const client = drive.drive({ version: 'v3', auth })
    const fileIds = await listDriveImages(client)
    console.log(`Found ${fileIds.length} images`)
    const serverImages = await listServerImages()
    await Promise.all([
      syncAddedDriveImages(client, fileIds, serverImages),
      syncRemovedDriveImages(fileIds, serverImages),
    ])
    console.log('Done')
  } catch (e) {
    console.error(e)
  }
}

if (config.syncDrive.schedule) {
  cron.schedule(config.syncDrive.schedule, syncDriveImages)
}
if (config.syncDrive.immediately) {
  syncDriveImages()
}
