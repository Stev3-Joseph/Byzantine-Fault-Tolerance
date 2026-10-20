const Node = require("../bftnode");
const Simulator = require("../simulator");
const { makeEquivocator } = require("../attacks");

const nodes = [new Node("A"), new Node("B"), new Node("C"), new Node("D")];
const sim = new Simulator(nodes);

makeEquivocator(nodes[3], { A: 100, B: 50, C: 75 });

for (const peer of ["A", "B", "C"]) {
    const vote = nodes[3].voteForPeer(peer);
    sim.recordMessage(1, "D", vote.value, peer);
}
