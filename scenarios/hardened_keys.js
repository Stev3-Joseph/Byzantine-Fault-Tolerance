const Node = require("../bftnode");
const Simulator = require("../simulator");
const { stealKey, forgeVote } = require("../attacks");

const nodes = [new Node("A"), new Node("B"), new Node("C"), new Node("D")];
const sim = new Simulator(nodes, null, { hardened: true });

const stolen = stealKey(nodes[0]);
const forged = forgeVote("A", stolen, 999);

console.log("Forged vote accepted before rotation?", sim.acceptVote(forged));

nodes[0].rotateKey();
console.log("Forged vote accepted after rotation?", sim.acceptVote(forged));

sim.revoke("B");
console.log("Vote from revoked B accepted?", sim.acceptVote(nodes[1].vote(100)));
