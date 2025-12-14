# Bitcoin transaction visualizer

This project is a web application that visualizes real-time Bitcoin transactions using undirected graphs. The application is built with JavaScript, VivaGraphJS, WebSockets, and Express. It utilizes HTTPS to serve front-end app and WSS to serve information about bitcoin transactions. By defualt, built-in self-signed certificate is used, you should provide your own certificate as specified in the `Usage with docker` or `Usage with node` section.

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

> [!NOTE]
> Available at: https://bitcoin.labcluster.org/

## Nodes colors
- Orange nodes represent null transaction inputs (in case if `getrawtransaction` has failed)
- Red nodes represent transaction inputs
- Green nodes represent transaction outputs
- White nodes represent the transaction

## Functions
- Double click on a input/output to open address details page in new tab (blockchain.com)
- Double click on a transaction to open it's details page in new tab (blockchain.com)
- Click on a input/output to copy it's address
- Click on a transaction to copy it's hash ID

## Setup

To run this project you need to have either docker and compose or node installed on your machine. Application requires a Bitcoin node with RPC and ZMQ enabled.

## Example Bitcoin node configuration

Below is an example configuration for the Bitcoin node that is optimized for lower disk usage:

```
server=1

rpcbind=0.0.0.0
rpcallowip=0.0.0.0/0
rpcuser=username
rpcpassword=password

zmqpubrawblock=tcp://0.0.0.0:28334
zmqpubrawtx=tcp://0.0.0.0:28334
      
[main]
# This prevents Bitcoin Core from maintaining a full transaction index, reducing database size.
# txindex=1 and prune is NOT compatible
txindex=0

# Enable pruning to limit disk usage to 20GB
prune=20000
```

## Environment variables
The application requires the following environment variables to be set. Docker image has them set to default values:

| Variable               | Description                                                            | Default                 |
|------------------------|------------------------------------------------------------------------|-------------------------|
| `EXTERNAL_SERVER_PORT` | The port on which the WebSocket and HTTP server will run.              | `80`                    |
| `INTERNAL_SERVER_PORT` | The port fronted will expect secure WebSocket server to be accessible. | `443`                   |
| `ZMQ_URI`              | The URI for ZeroMQ to listen for raw Bitcoin transactions.             | `tcp://localhost:28332` |
| `RPC_URI`              | The URI for the Bitcoin node RPC interface.                            | `http://localhost:8332` |
| `RPC_USERNAME`         | The username for accessing the Bitcoin node RPC.                       | `username`              |
| `RPC_PASSWORD`         | The password for accessing the Bitcoin node RPC.                       | `password`              |

## Usage with docker

Example `docker-compose.yml`

```yaml
name: bitcoin

include:
  - /own/docker/networks.yml

services:
  # Optional Bitcoin Core setup if you want to run it on the same machine
  bitcoin-core:
    container_name: bitcoin-core
    hostname: bitcoin-core
    image: bitcoin/bitcoin:latest
    restart: unless-stopped
    networks:
      - bitcoin-nw
    #Change bitcoin-28.1 to correct folder name based on what Bitcoin Core version you are using.
    #You can check folder name manually by running the container and using:
    #docker exec -it bitcoin-core /bin/bash
    volumes:
      - .bitcoin.conf:/opt/bitcoin-28.1/bitcoin.conf

  bitcoin-visualizer:
    container_name: bitcoin-visualizer
    image: gq97a6/bitcoin-visualizer:latest
    restart: unless-stopped
    networks:
      - bitcoin-nw
    environment:
      INTERNAL_SERVER_PORT: 80
      EXTERNAL_SERVER_PORT: 443
      ZMQ_URI: tcp://bitcoin-core:28332
      RPC_URI: http://bitcoin-core:8332
      RPC_USERNAME: username
      RPC_PASSWORD: password
```