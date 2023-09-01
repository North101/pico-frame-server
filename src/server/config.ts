import 'dotenv-flow/config'

export default {
  port: parseInt(process.env.PORT!),
  imageDir: process.env.IMAGE_DIR!,
  imageExts: process.env.IMAGE_EXTS!.split(','),
  credentials: process.env.CREDENTIALS!,
}
