const Node = require("../bftnode");
const Simulator = require("../simulator");
const { makeByzantine, stealKey, forgeVote } = require("../attacks");

const honest = () => ["A", "B", "C", "D"].map(id => new Node(id));

/* ATTACK 1: weak quorum -> conflicting commits */
console.log("\n##### ATTACK 1: QUORUM TAMPERING #####");
class WeakQuorum {
    size() { return 2; }
    reached(n) { return n >= 2; }
}
const n1 = honest();
makeByzantine(n1[2], 50);
makeByzantine(n1[3], 50);
new Simulator(n1, new WeakQuorum()).runConsensus(100);

/* ATTACK 2: 2 Byzantine nodes -> no consensus */
console.log("\n##### ATTACK 2: TOO MANY BYZANTINE NODES #####");
const n2 = honest();
makeByzantine(n2[2], 50);
makeByzantine(n2[3], 75);
new Simulator(n2).runConsensus(100);

/* ATTACK 3: key theft -> impersonation */
console.log("\n##### ATTACK 3: KEY THEFT #####");
const n3 = honest();
const forged = forgeVote("A", stealKey(n3[0]), 999);
console.log("Forged vote:", forged);
console.log(
    "Signature valid?",
    n3[0].verifyVote(forged, () => n3[0].secret)
);

/* ATTACK 4: Sybil takeover -> attacker decides the value */
console.log("\n##### ATTACK 4: SYBIL TAKEOVER #####");
const n4 = honest();
for (let i = 1; i <= 10; i++) {
    const fake = new Node("X" + i);
    makeByzantine(fake, 50);
    n4.push(fake);
}
new Simulator(n4).runConsensus(100);