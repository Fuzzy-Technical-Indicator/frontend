FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install; exit 0

RUN bun run build

EXPOSE 3000

WORKDIR build 

CMD ["bun", "run", "start"]
