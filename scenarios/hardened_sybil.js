const Node = require("../bftnode");
const Simulator = require("../simulator");
const { makeByzantine } = require("../attacks");

function build() {
    const nodes = [new Node("A"), new Node("B"), new Node("C"), new Node("D")];
    for (const id of ["X1", "X2", "X3", "X4"]) {
        const fake = new Node(id);
        makeByzantine(fake, 50);
        nodes.push(fake);
    }
    return nodes;
}

console.log("##### WITHOUT DEFENCE #####");
new Simulator(build()).runConsensus(100);

console.log("\n##### WITH ADMISSION CONTROL #####");
new Simulator(build(), null, {
    hardened: true,
    approvedValidators: ["A", "B", "C", "D"]
}).runConsensus(100);
