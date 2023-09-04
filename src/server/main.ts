import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import ViteExpress from 'vite-express'
import config from './config'
import './cron'
import { listServerImages } from './util'

const app = express()

const parseAuthorization = (value: string | undefined) => {
  const parts = value?.split(' ')
  if (parts == undefined || parts.length != 2) return null

  return {
    scheme: parts[0].toLowerCase(),
    value: parts[1],
  }
}

app.use((req, res, next) => {
  if (!config.apiKey) return next()

  const authorization = parseAuthorization(req.get('Authorization'))
  if (authorization?.scheme != 'basic' || authorization?.value != config.apiKey) {
    return res.status(401).json({ error: 'unauthorised' }).end()
  }

  return next()
})

app.get('/images', async (req, res) => {
  const images = await listServerImages()
  const data = await Promise.all(images
    .map(async image => {
      const stat = await fs.stat(path.join(config.imageDir, image))
      return {
        file: image,
        uploaded: stat.birthtime.toISOString(),
      }
    }))
  data.sort((a, b) => -a.uploaded.localeCompare(b.uploaded))
  return res.status(200).json(data).end()
})

app.get('/images/:image', async (req, res) => {
  const images = await listServerImages()
  const image = images.find(file => file == req.params.image)
  if (image == undefined) return res.status(404).end()

  return res.download(path.join(config.imageDir, image))
})

app.get('/random_image', async (req, res) => {
  const images = await listServerImages()
  if (images.length == 0) return res.status(404).end()

  const index = Math.floor(Math.random() * images.length)
  return res.download(path.join(config.imageDir, images[index]))
})

ViteExpress.listen(app, config.port, () =>
  console.log(`Server is listening on port ${config.port}...`)
)
