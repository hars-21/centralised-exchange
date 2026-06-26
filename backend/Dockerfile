FROM oven/bun:1

WORKDIR /usr/src/app/

COPY package.json .
COPY bun.lock .

RUN bun install

COPY . .

RUN bun prisma generate

EXPOSE 8000
EXPOSE 8080

CMD [ "bun", "dev" ]