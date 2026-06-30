FROM oven/bun:1 AS base

WORKDIR /usr/src/app/

FROM base AS dev

COPY package.json .
COPY bun.lock .

RUN bun install

COPY . .

CMD [ "bun", "dev" ]

FROM base AS builder

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM base AS runner

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "bun", "run", "start" ]
