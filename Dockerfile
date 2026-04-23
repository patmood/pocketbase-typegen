# Dockerfile to run e2e integration tests against a test PocketBase server
FROM node:20-alpine

ARG POCKETBASE_VERSION=0.37.3

WORKDIR /app/

# Install the dependencies
RUN apk add --no-cache \
  bash \
  ca-certificates \
  curl \
  gcompat \
  unzip \
  wget \
  zip \
  zlib-dev

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Build project
COPY . .
RUN npm ci
RUN npm run build

# Download Pocketbase and install it
ADD https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip /tmp/pocketbase.zip
RUN unzip /tmp/pocketbase.zip -d /app/test/integration

RUN chmod +x ./test/integration/pocketbase ./test/integration/test.sh ./test/integration/serve.sh
EXPOSE 8090

CMD [ "./test/integration/test.sh" ]
