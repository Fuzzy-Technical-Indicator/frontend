# build stage
FROM oven/bun as builder

WORKDIR /app

COPY . .

ENV HUSKY 0

RUN bun install

RUN bun run build

# prod stage

FROM oven/bun:slim

COPY --from=builder /app/build /app

EXPOSE 3000

WORKDIR /app

ENTRYPOINT ["bun", "./index.js"]
