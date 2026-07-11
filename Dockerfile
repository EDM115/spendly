FROM node:26-alpine AS builder

ARG PORT=60000
ENV PORT=${PORT}
ENV NODE_ENV=development

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache bash ca-certificates sqlite && \
    update-ca-certificates

SHELL ["/bin/bash", "-c"]

WORKDIR /app/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PNPM_HOME}/bin:/app/node_modules/.bin:${PATH}"

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash - && \
    pnpm i --frozen-lockfile

COPY . /app/
COPY .env /app/.env

ENV NODE_ENV=production

RUN mkdir -p /app/db && \
    SEED=false pnpm build

###

FROM node:26-alpine

LABEL org.opencontainers.image.authors="EDM115 <docker@edm115.dev>"
LABEL org.opencontainers.image.base.name="node:26-alpine"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/EDM115/spendly.git"
LABEL org.opencontainers.image.title="Spendly"
LABEL org.opencontainers.image.url="https://github.com/EDM115/spendly"

ARG PORT=60000
ENV PORT=${PORT}
ENV NODE_ENV=production

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache bash sqlite

SHELL ["/bin/bash", "-c"]

WORKDIR /app/

COPY package.json ./

COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/drizzle /app/drizzle

RUN mkdir -p /app/db

VOLUME ["/app/db"]

EXPOSE ${PORT}

CMD ["node", "/app/.output/server/index.mjs"]
