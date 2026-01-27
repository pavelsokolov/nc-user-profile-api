import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  bodyLimit: process.env.BODY_LIMIT || '16kb',
} as const;
