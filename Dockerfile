FROM node:25-alpine AS builder

ARG PORT=60000
ENV PORT=${PORT}
ENV NODE_ENV=development

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache bash ca-certificates && \
    update-ca-certificates

SHELL ["/bin/bash", "-c"]

WORKDIR /app/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:/app/node_modules/.bin:$PATH

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

RUN pnpm i --frozen-lockfile

COPY . /app/
COPY .env /app/.env

ENV NODE_ENV=production

RUN mkdir -p db && \
    sed -i 's/SEED=false/SEED=true/' .env && \
    pnpm seed && \
    rm -fr init

RUN pnpm build

###

FROM node:25-alpine

LABEL org.opencontainers.image.authors="EDM115 <docker@edm115.dev>"
LABEL org.opencontainers.image.base.name="node:25-alpine"
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

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash - && \
    pnpm add -g dotenv-cli

COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/db /app/db
COPY --from=builder /app/.env /app/.env

VOLUME ["/app/db"]

EXPOSE ${PORT}

ENTRYPOINT ["dotenv", "--"]
CMD ["node", "/app/.output/server/index.mjs"]
