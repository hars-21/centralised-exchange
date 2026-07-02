FROM oven/bun:1 AS base

WORKDIR /usr/src/app/

FROM base AS dev

COPY package.json .
COPY bun.lock .

RUN bun install

COPY . .

CMD [ "bun", "run", "dev" ]

FROM base AS builder

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM nginx:1.27 AS runner

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]