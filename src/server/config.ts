import 'dotenv-flow/config'

export default {
  port: parseInt(process.env.PORT!),
  apiKey: process.env.API_KEY!,
  credentials: process.env.CREDENTIALS!,
  folderIds: process.env.FOLDER_IDS ? process.env.FOLDER_IDS.split(',') : null,
  imageDir: process.env.IMAGE_DIR!,
  imageMimeTypes: process.env.IMAGE_MIME_TYPES ? process.env.IMAGE_MIME_TYPES.split(',') : null,
}
