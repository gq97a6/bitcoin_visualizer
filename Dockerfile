FROM alpine:latest

WORKDIR /app

ENV SERVER_PORT=443
ENV ZMQ_URI=tcp://localhost:28332
ENV RPC_URI=http://localhost:8332
ENV RPC_USERNAME=username
ENV RPC_PASSWORD=password

COPY index.js ./
COPY docs ./docs
COPY package*.json ./

RUN apk add --update nodejs npm openssl
RUN apk add --no-cache python3 make g++
RUN npm install

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]