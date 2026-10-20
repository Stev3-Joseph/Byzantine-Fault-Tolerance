const Node = require("../bftnode");
const Simulator = require("../simulator");

class WeakQuorum {
    size() { return 2; }
    reached(n) { return n >= 2; }
}

const nodes = [new Node("A"), new Node("B"), new Node("C"), new Node("D")];

try {
    new Simulator(nodes, new WeakQuorum(), { hardened: true });
    console.log("NOT BLOCKED (unexpected)");
} catch (e) {
    console.log("BLOCKED:", e.message);
}
