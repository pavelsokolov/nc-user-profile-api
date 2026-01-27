import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { traceIdMiddleware } from './middleware/traceId.js';
import { requestLogMiddleware } from './middleware/requestLog.js';
import healthRoutes from './routes/health.js';
import profileRoutes from './routes/profile.js';
import { logger } from './logger.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.use(
  cors({
    origin: config.frontendOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: config.bodyLimit }));
app.use(traceIdMiddleware);
app.use(requestLogMiddleware);
app.use(healthRoutes);
app.use(profileRoutes);

app.listen(config.port, () => {
  logger.info('Server started', { port: config.port });
});

export default app;
