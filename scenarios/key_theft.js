const Node = require("../bftnode");

const {

    stealKey,
    forgeVote

} = require("../attacks");

const nodeA =
    new Node("A");

const stolenSecret =
    stealKey(nodeA);

const forgedVote =
    forgeVote(
        "A",
        stolenSecret,
        999
    );

console.log(
    "Forged message"
);

console.log(
    forgedVote
);