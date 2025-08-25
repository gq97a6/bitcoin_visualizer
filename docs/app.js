const graph = Viva.Graph.graph();
let enabled = true;

const ws = new WebSocket(`wss://${window.location.hostname}:${window.SERVER_PORT}`);
ws.onmessage = function (event) {
    try {
        const txInfo = JSON.parse(event.data);
        if (txInfo === null) {
            location.reload();
        } else if (enabled) {
            visualizeTransaction(txInfo);
        }
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
    }
};

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        enabled = !enabled;
        alert(enabled ? "Enabled" : "Disabled");
    }
});

function visualizeTransaction(txInfo) {
    graph.addNode(txInfo.txid, { type: 'tx' });

    addInputNodes(txInfo.inputs, txInfo.txid);
    addOutputNodes(txInfo.outputs, txInfo.txid);
}

function addInputNodes(inputs, txid) {
    inputs.forEach(input => {
        if (input.amount == 0) graph.addNode(input.address, { type: 'fake_in', amount: input.amount });
        else graph.addNode(input.address, { type: 'in', amount: input.amount });
        graph.addLink(input.address, txid);
    });
}

function addOutputNodes(outputs, txid) {
    outputs.forEach(output => {
        graph.addNode(output.address, { type: 'out', amount: output.amount });
        graph.addLink(output.address, txid);
    });
}

function main() {
    const graphics = Viva.Graph.View.webglGraphics();

    graphics.node(function (node) {
        const size = 20;
        let color = 0xFF0000FF; // Default color (blue)

        switch (node.data.type) {
            case 'tx':
                color = 0xFFFFFFFF; // White
                break;
            case 'out':
                color = 0x00FF00FF; // Green
                break;
            case 'in':
                color = 0xFF0000FF; // Red
                break;
            case 'fake_in':
                color = 0xff6200FF; // Red
                break;
        }

        return Viva.Graph.View.webglSquare(size, color);
    });

    const events = Viva.Graph.webglInputEvents(graphics, Viva.Graph.graph());
    events.mouseEnter((node) => {
        //console.log('Mouse entered node: ' + node.id);
    }).mouseLeave((node) => {
        //console.log('Mouse left node: ' + node.id);
    }).dblClick((node) => {
        //console.log('Double click on node: ' + node.id);
        window.open('https://www.blockchain.com/explorer/transactions/btc/' + node.id, '_blank');
    }).click((node) => {
        navigator.clipboard.writeText(node.id);
    });

    const renderer = Viva.Graph.View.renderer(graph, { graphics });
    renderer.run();
}

// Call the main function to initialize the graph visualization
main();
