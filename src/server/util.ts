import fs from 'fs/promises'
import path from 'path'
import config from './config'
import './cron'

export const fullImagePath = (filename: string) => path.join(config.imageDir, filename)

export const listServerImages = async () => {
  await fs.mkdir(config.imageDir, { recursive: true })
  const files = await fs.readdir(config.imageDir, {
    withFileTypes: true,
  })
  return files
    .filter(file => file.isFile() && path.extname(file.name) == '.jpg')
    .map(file => file.name)
}
