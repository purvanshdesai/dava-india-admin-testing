# 1. Base image
FROM node:22.7.0-alpine

# 2. Set working directory
WORKDIR /app

# 3. Enable Corepack (Yarn support)
RUN corepack enable

# 4. Copy package.json only (NO yarn.lock in repo)
COPY package.json ./

# 5. Install dependencies using Yarn
RUN yarn install

# 6. Copy rest of the application code
COPY . .

# 7. Build Next.js app
RUN yarn build

# 8. Expose port
EXPOSE 3030

# 9. Start app
CMD ["yarn", "start"]


