FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages packages
COPY apps/server apps/server
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm exec tsc -b packages/shared/tsconfig.json apps/server/tsconfig.json --force

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/server/dist apps/server/dist
EXPOSE 4319
CMD ["node", "apps/server/dist/index.js"]
