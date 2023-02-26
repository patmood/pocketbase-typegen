# Dockerfile to run e2e integration tests against a test PocketBase server
FROM node:16-alpine3.16

ARG POCKETBASE_VERSION=0.13.0

WORKDIR /app/output/
WORKDIR /app/

# Install the dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zip \
    zlib-dev

# Download Pocketbase and install it
ADD https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip /tmp/pocketbase.zip
RUN unzip /tmp/pocketbase.zip -d /app/

COPY package.json package-lock.json ./
RUN npm ci

# Copy test files
COPY test/integration ./
COPY test/pocketbase-types-example.ts ./
COPY dist/index.js ./dist/index.js

RUN chmod +x ./pocketbase
RUN chmod +x ./run.sh
EXPOSE 8090

CMD [ "./run.sh" ]
