# Версія образу збігається з @playwright/test у package-lock.json
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY playwright.config.ts tsconfig.json ./
COPY pages ./pages
COPY tests ./tests

ENV CI=true

CMD ["npx", "playwright", "test"]
