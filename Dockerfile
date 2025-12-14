FROM alpine:latest

WORKDIR /app

ENV EXTERNAL_SERVER_PORT=443
ENV INTERNAL_SERVER_PORT=80
ENV ZMQ_URI=tcp://localhost:28332
ENV RPC_URI=http://localhost:8332
ENV RPC_USERNAME=username
ENV RPC_PASSWORD=changeme

COPY src/index.js ./
COPY src/docs ./docs
COPY src/package*.json ./

RUN apk add --update nodejs npm openssl
RUN apk add --no-cache python3 make g++
RUN npm install

CMD ["node", "index.js"]