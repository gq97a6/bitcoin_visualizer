# Bitcoin transaction visualizer

This project is a web application that visualizes real-time Bitcoin transactions using undirected graphs. The application is built with JavaScript, VivaGraphJS, WebSockets, and Express. It utilizes HTTPS with a built-in self-signed certificate intended for localhost testing only. You should provide your own certificates as specified in the `Usage with docker` section.

## Setup

To run this project you need to have either docker and compose or node installed on your machine. Application requires a fully synchronized Bitcoin node with RPC and ZMQ enabled, as well as the transaction index (txindex) enabled.
## Example Bitcoin node configuration

The application requires a fully synchronized Bitcoin node with RPC and ZMQ enabled, as well as the transaction index (`txindex`) enabled. Below is an example configuration for the Bitcoin node:

```
server=1

rpcbind=0.0.0.0
rpcallowip=0.0.0.0/0
zmqpubrawblock=tcp://0.0.0.0:28334
zmqpubrawtx=tcp://0.0.0.0:28334

[main]
txindex=1
```

## Environment variables
The application requires the following environment variables to be set. Docker image has them set to default values:

| Variable       | Description                                                | Default    | 
|----------------|------------------------------------------------------------| ---------- |
| `SERVER_PORT`  | The port on which the WebSocket server will run.           | `433`      |
| `WEB_PORT`     | The port on which the web application will be accessible.  | `3000`     |
| `ZMQ_URI`      | The URI for ZeroMQ to listen for raw Bitcoin transactions. | `28332`    |
| `RPC_URI`      | The URI for the Bitcoin node RPC interface.                | `8332`     |
| `RPC_USERNAME` | The username for accessing the Bitcoin node RPC.           | `username` |
| `RPC_PASSWORD` | The password for accessing the Bitcoin node RPC.           | `password` |

## Usage with docker

1. Ensure your Bitcoin node is running with the appropriate configuration
2. Create `docker-compose.yml` file
3. Edit configuration to match your specifications
4. Optionaly remove `volumes` section to use included self-signed certificate
4. Run `docker-compose up -d`

## Example `docker-compose.yml`

```yaml
services:
  bitcoin-visualizer:
    container_name: bitcoin-visualizer
    image: gq97a6/bitcoin-visualizer:1.0.0
    restart: unless-stopped
    ports:
      - 3000:3000
      - 443:443
    volumes:
        - key.pem:/app/certs/key.pem
        - cert.pem:/app/certs/cert.pem
    environment:
      SERVER_PORT: 3000
      WEB_PORT: 443
      ZMQ_URI: tcp://localhost:28332
      RPC_URI: http://localhost:8332
      RPC_USERNAME: user
      RPC_PASSWORD: pass
```

## Usage with node (Linux)

1. Ensure your Bitcoin node is running with the appropriate configuration
2. Clone this repository
3. Run `npm install`
4. Optionaly swap included self-signed certificate for own
4. Run `SERVER_PORT=3000 WEB_PORT=443 ZMQ_URI=tcp://localhost:28332 RPC_URI=http://localhost:8332 RPC_USERNAME=user RPC_PASSWORD=pass node index.js`

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
