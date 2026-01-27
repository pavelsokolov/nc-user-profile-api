import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import profileRoutes from './routes/profile.js';

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
app.use(profileRoutes);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

export default app;
