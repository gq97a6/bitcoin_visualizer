const fs = require("fs");
const https = require("https");
const ws = require("ws");
const express = require("express");
const zmq = require("zeromq");
const bitcoin = require("bitcoinjs-lib");
const E = process.env;

// Server options for HTTPS
const serverOptions = {
    key: fs.readFileSync("./certs/key.pem"),
    cert: fs.readFileSync("./certs/cert.pem")
};

const sockets = [];

// Create HTTPS server for WebSocket connections
const httpServer = https.createServer(serverOptions).listen(E.SERVER_PORT);
const wss = new ws.Server({ server: httpServer });

wss.on("connection", (socket) => {
    console.log("NEW_SOCKET");
    sockets.push(socket);

    socket.on("close", () => {
        console.log("REMOVED_SOCKET");
        const index = sockets.indexOf(socket);
        if (index > -1) {
            sockets.splice(index, 1);
        }
    });
});

// Create Express app to serve static files and config
const app = express();
app.use(express.static("docs"));
app.get("/config.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`window.SERVER_PORT = ${E.SERVER_PORT}`);
});

https.createServer(serverOptions, app).listen(E.WEB_PORT);

// Fetch function to dynamically import node-fetch
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Function to call RPC method
async function callRpc(method, params = []) {
    const response = await fetch(E.RPC_URI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(`${E.RPC_USERNAME}:${E.RPC_PASSWORD}`).toString("base64"),
        },
        body: JSON.stringify({
            jsonrpc: "1.0",
            id: "curltext",
            method: method,
            params: params,
        }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.result;
}

// Function to get address from output script
function getAddressFromOutput(output) {
    try {
        return bitcoin.address.fromOutputScript(output.script);
    } catch (error) {
        if (output.script[0] === 0x51 && output.script.length === 34) { // Taproot condition, might need adjustment
            return bitcoin.address.toBech32(output.script.slice(2, 34), 0, "bc");
        } else {
            return null;
        }
    }
}

// Function to decode transaction
async function decodeTransaction(txHex) {
    const tx = bitcoin.Transaction.fromHex(txHex);
    const txid = tx.getId();
    const inputs = [];
    const outputs = [];

    // Process inputs
    for (const input of tx.ins) {
        const txid = Buffer.from(input.hash).reverse().toString("hex");
        const detail = await callRpc("getrawtransaction", [txid, true]);
        const vin = input.index;
        const address = detail.vout[vin].scriptPubKey.address;
        const amount = detail.vout[vin].value;
        inputs.push({ address, amount });
    }

    // Process outputs
    for (const output of tx.outs) {
        const address = getAddressFromOutput(output);
        if (address == null) return null;

        const amount = output.value / 1e8; // Convert satoshis to BTC
        outputs.push({ address, amount });
    }

    return { txid, inputs, outputs };
}

// Function to run ZMQ subscriber
async function run() {
    const sock = new zmq.Subscriber();
    sock.connect(E.ZMQ_URI);
    sock.subscribe("");

    for await (const [filter, message] of sock) {
        const topic = filter.toString();

        if (topic === "rawtx") {
            const txHex = message.toString("hex");
            decodeTransaction(txHex).then(txInfo => {
                if (txInfo != null) {
                    for (const socket of sockets) {
                        socket.send(JSON.stringify(txInfo));
                    }
                }
            }).catch(error => {
                console.error('Error decoding transaction:', error);
            });
        }
    }
}

// Log environment variables
console.log("WEB_PORT:", E.WEB_PORT);
console.log("SERVER_PORT:", E.SERVER_PORT);
console.log("USE_HTTPS:", E.USE_HTTPS);
console.log("ZMQ_URI:", E.ZMQ_URI);
console.log("RPC_URI:", E.RPC_URI);
console.log("RPC_USERNAME:", E.RPC_USERNAME);
console.log("RPC_PASSWORD:", E.RPC_PASSWORD);

// Start the ZMQ subscriber
run();
