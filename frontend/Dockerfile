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
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/src ./src

EXPOSE 3000

CMD [ "bun", "run", "start" ]
