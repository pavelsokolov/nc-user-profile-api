import app from './app.js'
import { config } from './config.js'
import { logger } from './logger.js'

app.listen(config.port, () => {
  logger.info('Server started', { port: config.port })
})

export default app
