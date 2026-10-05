FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=0 /app/dist ./dist
COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/prisma ./prisma
COPY --from=0 /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["node", "dist/main"]
