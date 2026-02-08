# -----------------------
# Build stage
# -----------------------
FROM node:22.7.0-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# -----------------------
# Runtime stage
# -----------------------
FROM node:22.7.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./

RUN yarn install --frozen-lockfile --production \
  && yarn cache clean \
  && rm -rf /usr/local/share/.cache \
  && rm -rf /root/.cache \
  && rm -rf /tmp/*

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3030
CMD ["yarn", "start"]
