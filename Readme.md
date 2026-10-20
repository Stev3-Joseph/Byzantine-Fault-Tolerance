PART 1

TASKS
Ran npm run honest.
Votes: A, B, C and D all voted 100.
Tally and quorum: the tally was 100 → 4 votes. Required quorum = 3, calculated as floor(2 × 4 / 3) + 1 = 3.
Committed value: 100.

Why was the value accepted? 4 votes met the quorum of 3.
Did any individual node decide? No. The outcome came from the vote count against the rule.
What evidence exists? The signed votes and the tally. Be aware that the current simulator only prints the tally and doesn’t verify signatures or store a certificate. Part 8 adds that.
Role of the quorum? It sets how many matching votes are needed, and its size guarantees safety.

PART 2: Byzantine Behaviour

TASKS

Ran npm run byzantine.
Votes: A, B and C voted 100. D (Byzantine) voted 50.
Tally and quorum: 100 → 3, 50 → 1. Required quorum = 3.
Compared with Part 1: the tally was 4 vs 0 before, and now it is 3 vs 1.
Committed value: 100.

Reflection questions

Why did consensus still succeed? Three honest votes met the quorum of 3.
Did the protocol need to identify the malicious node? No. It only counts votes.
How many Byzantine nodes can it tolerate? 1 (4 ≥ 3f + 1 gives f = 1).
What assumption is it making? That at most f nodes are Byzantine.
PART 3: Equivocation

TASKS

Ran npm run equivocation.
Values sent by D: A got 100, B got 50, C got 75.
Messages: three objects { nodeId: 'D', value: ..., signature: '...' }, each with a different value and a different signature.
Comparison: each recipient sees only one message, and each looks normal.

Reflection questions

Are the messages correctly signed? Yes, all three are signed with D’s secret.
Why is it more dangerous than a wrong vote? It splits the honest nodes’ view of the system, and each message looks valid on its own.
Could one recipient detect it? No, because it sees only its own message.
Why must nodes exchange evidence? Comparing what each node received is the only way to find the conflict.
PART 4: Cryptographic Evidence and Key Theft

TASKS

Reviewed signing: sign() in crypto.js hashes nodeId:value:secret with SHA-256, so anyone who knows the secret can produce a valid signature.
Ran npm run key-theft.
Forged vote: stealKey(nodeA) returned secret-A, which was used to sign a vote from A for 999.
Comparison: the forged vote has the same format as a real vote from A (nodeId: 'A', a value, a valid signature). Nothing in it shows it is fake.

Reflection questions

Can honest nodes tell a forged message apart? No.
Why does verification succeed? The attacker used the real secret.
What does the protocol assume about keys? That each key is known only to its owner.
What happens if that assumption fails? The attacker can impersonate that node indefinitely, and consensus can’t protect against it.
PART 5: Sybil Attacks and Membership

TASKS

Ran npm run sybil.
New nodes: the script printed A, B, C, D, then added X1, X2, X3 and X4 with no checks. The set grew from 4 to 8.
Attacker-controlled: X1, X2, X3, X4.
Effect: the attacker holds 4 of 8 votes, and the quorum rises to floor(2 × 8 / 3) + 1 = 6, so honest nodes (4 votes) can no longer reach it alone.

Reflection questions

Who decides which nodes may participate? In this simulator, nobody, because any node can be added. In real systems it is governance, such as an approved validator list.
Why doesn’t consensus solve identity? Consensus counts identities. It doesn’t check who is behind them.
How do blockchains prevent Sybil attacks? By making identities costly: proof of work (computing power) or proof of stake (locked funds).
What if an attacker controls a majority? They can decide the outcome, and the system’s guarantees no longer hold.
PART 6: Quorum Reasoning and Safety

TASKS

Ran npm run quorum.
Modified quorum: WeakQuorum returns size() = 2 instead of 3.
Votes: A and B voted 100, C and D voted 50.
Tally: 100 → 2, 50 → 2. Required quorum = 2.
Outcome: both values reached quorum, giving SAFETY VIOLATION!
Comparison with the original: with quorum 3, neither value would reach it, so the result would be NO CONSENSUS. That is safe, because nothing wrong is committed.

Reflection questions

Why does the modified rule fail? The quorum is too small, so two different groups can each satisfy it.
What property was lost? Quorum overlap, and with it safety.
Can multiple values reach quorum at once? Yes. Here both 100 and 50 did.
Why must quorums overlap? So every new decision shares at least one honest node with every earlier decision, which stops two conflicting values from both being committed.