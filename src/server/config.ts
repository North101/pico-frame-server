import 'dotenv-flow/config'

export default {
  port: parseInt(process.env.PORT!),
  apiKey: process.env.API_KEY!,
  credentials: process.env.CREDENTIALS!,
  folderIds: process.env.FOLDER_IDS!.split(','),
  imageDir: process.env.IMAGE_DIR!,
  imageExts: process.env.IMAGE_EXTS!.split(','),
}
