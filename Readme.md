# BFT Lab: Breaking and Understanding Byzantine Fault Tolerance

**Unit:** Fundamentals of System Security (COMSM0122)
**Workshop:** 2 - Breaking and Understanding Byzantine Fault Tolerance
**Date:** `<20-10-2026>`
**Authors:** `Steve Joseph`

## Overview

A simplified JavaScript BFT simulator used to observe, attack and harden a consensus protocol. Nodes vote on a proposed value, and a value is committed once it reaches a quorum of `floor(2n/3) + 1` votes.

## Project structure

```
bft-lab/
├── package.json
├── simulator.js
├── bftnode.js
├── network.js
├── crypto.js
├── quorum.js
├── attacks.js
└── scenarios/
    ├── honest.js
    ├── byzantine.js
    ├── equivocation.js
    ├── key_theft.js
    ├── sybil.js
    ├── quorum_tampering.js
    └── break_bft.js
```


## Setup and running

Requires Node.js 18 or newer. Run all commands from the `bft-lab` folder.

```bash
npm install
npm run honest
```

| Command | Scenario |
|---|---|
| `npm run honest` | Part 1: honest consensus |
| `npm run byzantine` | Part 2: one Byzantine node |
| `npm run equivocation` | Part 3: conflicting signed messages |
| `npm run key-theft` | Part 4: forged vote with a stolen key |
| `npm run sybil` | Part 5: fake validators |
| `npm run quorum` | Part 6: weakened quorum |
| `npm run break` | Part 7: combined attacks |

---

## Part 1: The Trust Problem

**Tasks**

- Ran `npm run honest`.
- Votes: A, B, C and D all voted 100.
- Tally and quorum: `100 → 4` votes. Required quorum = 3, from `floor(2 × 4 / 3) + 1`.
- Committed value: **100**.

**Reflection questions**

| Question | Answer |
|---|---|
| Why was the value accepted? | 4 votes met the quorum of 3. |
| Did any individual node decide? | No. The outcome came from the vote count against the rule. |
| What evidence exists? | The signed votes and the tally. The base simulator only prints the tally and does not verify signatures or store a certificate (Part 8 adds this). |
| Role of the quorum? | It sets how many matching votes are needed, and its size guarantees safety. |

---

## Part 2: Byzantine Behaviour

**Tasks**

- Ran `npm run byzantine`.
- Votes: A, B and C voted 100. D (Byzantine) voted 50.
- Tally and quorum: `100 → 3`, `50 → 1`. Required quorum = 3.
- Compared with Part 1: the tally was 4 vs 0 before, and now it is 3 vs 1.
- Committed value: **100**.

**Reflection questions**

| Question | Answer |
|---|---|
| Why did consensus still succeed? | Three honest votes met the quorum of 3. |
| Did the protocol need to identify the malicious node? | No. It only counts votes. |
| How many Byzantine nodes can it tolerate? | 1 (`4 ≥ 3f + 1` gives `f = 1`). |
| What assumption is it making? | That at most `f` nodes are Byzantine. |

---

## Part 3: Equivocation

**Tasks**

- Ran `npm run equivocation`.
- Values sent by D: A got 100, B got 50, C got 75.
- Messages: three objects `{ nodeId: 'D', value: ..., signature: '...' }`, each with a different value and signature.
- Comparison: each recipient sees only one message, and each looks normal.

**Reflection questions**

| Question | Answer |
|---|---|
| Are the messages correctly signed? | Yes, all three are signed with D's secret. |
| Why is it more dangerous than a wrong vote? | It splits the honest nodes' view of the system, and each message looks valid on its own. |
| Could one recipient detect it? | No, because it sees only its own message. |
| Why must nodes exchange evidence? | Comparing what each node received is the only way to find the conflict. |

---

## Part 4: Cryptographic Evidence and Key Theft

**Tasks**

- Reviewed signing: `sign()` in `crypto.js` hashes `nodeId:value:secret` with SHA-256, so anyone who knows the secret can produce a valid signature.
- Ran `npm run key-theft`.
- Forged vote: `stealKey(nodeA)` returned `secret-A`, which was used to sign a vote from A for 999.
- Comparison: the forged vote has the same format as a real vote from A. Nothing in it shows it is fake.

**Reflection questions**

| Question | Answer |
|---|---|
| Can honest nodes tell a forged message apart? | No. |
| Why does verification succeed? | The attacker used the real secret. |
| What does the protocol assume about keys? | That each key is known only to its owner. |
| What happens if that assumption fails? | The attacker can impersonate that node indefinitely, and consensus cannot protect against it. |

---

## Part 5: Sybil Attacks and Membership

**Tasks**

- Ran `npm run sybil`.
- New nodes: X1, X2, X3 and X4 were added with no checks. The set grew from 4 to 8.
- Attacker-controlled: X1, X2, X3, X4.
- Effect: the attacker holds 4 of 8 votes. The quorum rises to `floor(2 × 8 / 3) + 1 = 6`, so the honest nodes (4 votes) can no longer reach it alone.

**Reflection questions**

| Question | Answer |
|---|---|
| Who decides which nodes may participate? | In this simulator, nobody. In real systems it is governance, such as an approved validator list. |
| Why doesn't consensus solve identity? | Consensus counts identities. It does not check who is behind them. |
| How do blockchains prevent Sybil attacks? | By making identities costly: proof of work (computing power) or proof of stake (locked funds). |
| What if an attacker controls a majority? | They can decide the outcome, and the system's guarantees no longer hold. |

---

## Part 6: Quorum Reasoning and Safety

**Tasks**

- Ran `npm run quorum`.
- Modified quorum: `WeakQuorum` returns `size() = 2` instead of 3.
- Votes: A and B voted 100, C and D voted 50.
- Tally: `100 → 2`, `50 → 2`. Required quorum = 2.
- Outcome: both values reached quorum, giving **SAFETY VIOLATION!**
- Comparison: with quorum 3, neither value would reach it, giving NO CONSENSUS. That is safe, because nothing wrong is committed.

**Reflection questions**

| Question | Answer |
|---|---|
| Why does the modified rule fail? | The quorum is too small, so two different groups can each satisfy it. |
| What property was lost? | Quorum overlap, and with it safety. |
| Can multiple values reach quorum at once? | Yes. Here both 100 and 50 did. |
| Why must quorums overlap? | So every new decision shares at least one honest node with every earlier decision, which stops two conflicting values from both being committed. |

---

## Part 7: Breaking BFT

All four attacks are in `scenarios/break_bft.js` and run with `npm run break`.

**Attacks and modifications**

| # | Attack | What was modified |
|---|---|---|
| 1 | Quorum tampering | Quorum replaced by `WeakQuorum` (size 2). C and D vote 50. |
| 2 | Two Byzantine nodes | C and D vote different wrong values (50 and 75). |
| 3 | Key theft | A's secret stolen with `stealKey`, vote forged with `forgeVote`. |
| 4 | Sybil takeover | 10 fake validators (X1 to X10) added, all voting 50. |

**Goals and results**

| Goal | Attack | Result |
|---|---|---|
| Create conflicting commits | 1 | Tally `{50: 2, 100: 2}`, **SAFETY VIOLATION!** |
| Prevent consensus | 2 | Tally `{100: 2, 50: 1, 75: 1}`, quorum 3, **NO CONSENSUS** |
| Impersonate validators | 3 | Forged vote for 999, `Signature valid? true` |
| Manipulate membership | 4 | 14 nodes, quorum 10, tally `{100: 4, 50: 10}`, **COMMITTED: 50** |
| Weaken quorum guarantees | 1 | Quorum 2 instead of 3 |

**Reflection questions**

| | Attack 1: Quorum tampering | Attack 2: Two Byzantine nodes | Attack 3: Key theft | Attack 4: Sybil takeover |
|---|---|---|---|---|
| Assumption violated | Quorum size guarantees overlap | At most `f = 1` node is faulty | Private keys stay secret | Only legitimate validators join, so under a third are faulty |
| Type of issue | Protocol configuration or implementation | Protocol assumption, caused by infrastructure compromise | Infrastructure and key management | Governance and admission control |
| Safety failed? | Yes | No | Not by itself, but the stolen identity can push a forged vote | Yes, the attacker's value was committed |
| Availability failed? | No | Yes | No | Yes, for the honest value 100 |
| Real deployment? | Yes, through a misconfiguration or bug | Yes, if 2 of 4 nodes are compromised | Yes, through malware, leaked keys or insiders | Yes, in open networks with cheap identities |

> **Conclusion:** the BFT protocol worked as designed in every attack. Each failure came from a broken assumption: a bad quorum parameter, too many faulty nodes, leaked keys, or uncontrolled membership. Protocol correctness is not the same as system security.

---

## Part 8: Hardening

*(Add after completing the hardening tasks.)*

| Task | Defence | Command |
|---|---|---|
| 8.1 | Equivocation detection | `npm run h-equivocation` |
| 8.2 | Key rotation and revocation | `npm run h-keys` |
| 8.3 | Validator admission control | `npm run h-sybil` |
| 8.4 | Quorum sanity check | `npm run h-quorum` |
| 8.5 | Commit certificate | `npm run h-cert` |

## Part 9: Secure the Simulator

*(For each defence: attack addressed, assumption strengthened, implementation changes, demo, remaining limitations.)*
