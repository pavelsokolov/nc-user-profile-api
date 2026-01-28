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

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Create API router
const apiRouter = express.Router()
apiRouter.use(profileRoutes)
app.use('/api', apiRouter)

// 404 for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// Error handling middleware
app.use(errorHandler)

export default app
