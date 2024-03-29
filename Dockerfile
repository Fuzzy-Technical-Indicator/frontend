# build stage
FROM oven/bun as builder

WORKDIR /app

COPY . .

ENV HUSKY 0

RUN bun install --verbose --frozen-lockfile

RUN bun run build

# prod stage

FROM oven/bun:slim

COPY --from=builder /app/build /app

EXPOSE 4000

WORKDIR /app

RUN echo "PORT=4000" >> .env

ENTRYPOINT ["bun", "./index.js"]
