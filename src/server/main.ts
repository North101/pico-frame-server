import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import ViteExpress from 'vite-express'
import config from './config'
import './cron'

const app = express()

app.get('/images', async (req, res) => {
  await fs.mkdir(config.imageDir, { recursive: true })
  const files = await fs.readdir(config.imageDir, {
    withFileTypes: true,
  })
  const images = await Promise.all(files
    .filter(file => file.isFile() && config.imageExts.includes(path.extname(file.name)))
    .map(async file => {
      const stat = await fs.stat(path.join(config.imageDir, file.name))
      return {
        file: file.name,
        uploaded: stat.birthtime.toISOString(),
      }
    }))
  images.sort((a, b) => -a.uploaded.localeCompare(b.uploaded))
  return res.status(200).json(images).end()
})

app.get('/images/:image', async (req, res) => {
  return res.download(path.join(config.imageDir, req.params.image))
})

app.get('/random_image', async (req, res) => {
  await fs.mkdir(config.imageDir, { recursive: true })
  const files = await fs.readdir(config.imageDir, {
    withFileTypes: true,
  })
  const index = Math.floor(Math.random() * files.length)
  return res.download(path.join(config.imageDir, files[index].name))
})

ViteExpress.listen(app, config.port, () =>
  console.log(`Server is listening on port ${config.port}...`)
)
