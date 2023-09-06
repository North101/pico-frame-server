import 'dotenv-flow/config'
import envVar from 'env-var'

export default {
  port: envVar.get('PORT').required().asPortNumber(),
  apiKey: envVar.get('API_KEY').required().asString(),
  syncDriveSchedule: envVar.get('SYNC_DRIVE_SCHEDULE').required().asString(),
  drive: {
    credentials: envVar.get('CREDENTIALS').required().asString(),
    folderIds: envVar.get('FOLDER_IDS').asArray(','),
    mimeTypes: envVar.get('IMAGE_MIME_TYPES').asArray(','),
  },
  image: {
    dir: envVar.get('IMAGE_DIR').required().asString(),
    height: envVar.get('IMAGE_HEIGHT').required().asIntPositive(),
    width: envVar.get('IMAGE_WIDTH').required().asIntPositive(),
  },
}
