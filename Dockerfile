FROM alpine:latest

WORKDIR /app

ENV WEB_PORT=433
ENV SERVER_PORT=3000
ENV ZMQ_URI=tcp://localhost:28332
ENV RPC_URI=http://localhost:8332
ENV RPC_USERNAME=username
ENV RPC_PASSWORD=password

COPY index.js ./
COPY docs ./docs
COPY package*.json ./

RUN apk add --update nodejs npm openssl
RUN npm install

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]