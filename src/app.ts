import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { traceIdMiddleware } from './middleware/traceId.js'
import { errorHandler } from './middleware/errorHandler.js'
import profileRoutes from './routes/profile.js'

const app = express()

app.disable('x-powered-by')
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }),
)

app.use(
  cors({
    origin: config.frontendOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: config.bodyLimit }))
app.use(traceIdMiddleware)

import { Router } from 'express'

const router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(profileRoutes)
app.use(errorHandler)

export default app
