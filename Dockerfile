FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:22-slim AS runtime
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]