const Node = require("../bftnode");
const Simulator = require("../simulator");

const nodes = [new Node("A"), new Node("B"), new Node("C"), new Node("D")];
new Simulator(nodes, null, { hardened: true }).runConsensus(100);
