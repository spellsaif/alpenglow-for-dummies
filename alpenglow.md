# Alpenglow Consensus Protocol — Complete Technical Reference
> Solana Alpenglow White Paper v1.1 (July 22, 2025) — Full AI-Optimized Breakdown  
> Authors: Quentin Kniep, Jakub Sliwinski, Roger Wattenhofer (Anza)

---

## Table of Contents
1. [What Is Alpenglow?](#1-what-is-alpenglow)
2. [The "World Computer" Motivation](#2-the-world-computer-motivation)
3. [System Model and Assumptions](#3-system-model-and-assumptions)
4. [Fault Tolerance — The "20+20" Design](#4-fault-tolerance--the-2020-design)
5. [Performance Metrics](#5-performance-metrics)
6. [Cryptographic Primitives Used](#6-cryptographic-primitives-used)
7. [Data Structures: Shred, Slice, Block](#7-data-structures-shred-slice-block)
8. [Rotor — Block Dissemination](#8-rotor--block-dissemination)
9. [Blokstor — Block Storage](#9-blokstor--block-storage)
10. [Votes and Certificates](#10-votes-and-certificates)
11. [Pool — Vote Aggregation Store](#11-pool--vote-aggregation-store)
12. [Votor — The Voting Algorithm](#12-votor--the-voting-algorithm)
13. [Block Creation (Leader Logic)](#13-block-creation-leader-logic)
14. [Repair — Fetching Missing Blocks](#14-repair--fetching-missing-blocks)
15. [Safety Proofs](#15-safety-proofs)
16. [Liveness Proofs](#16-liveness-proofs)
17. [Higher Crash Resilience (Assumption 2+3)](#17-higher-crash-resilience-assumption-23)
18. [Smart Sampling (PS-P)](#18-smart-sampling-ps-p)
19. [Voting vs. Execution Models](#19-voting-vs-execution-models)
20. [Asynchrony in Practice — Joining & Standstill](#20-asynchrony-in-practice--joining--standstill)
21. [Dynamic Timeouts](#21-dynamic-timeouts)
22. [Protocol Parameters](#22-protocol-parameters)
23. [Bandwidth Analysis](#23-bandwidth-analysis)
24. [Latency Simulation Results](#24-latency-simulation-results)
25. [Related Work Comparison](#25-related-work-comparison)
26. [Key Innovations Summary](#26-key-innovations-summary)

---

## 1. What Is Alpenglow?

Alpenglow is a **new consensus protocol** for a global, high-performance, proof-of-stake blockchain. It is designed to replace Solana's existing consensus (Tower BFT) and is being developed by Anza.

It is composed of two major sub-protocols:

| Sub-Protocol | Role |
|---|---|
| **Rotor** | Fast, bandwidth-efficient block *dissemination* using erasure coding |
| **Votor** | The *voting/finalization* logic — determines if a block is accepted |

Supporting structures:

| Structure | Role |
|---|---|
| **Blokstor** | Stores received blocks/shreds |
| **Pool** | Stores votes and certificates; emits events |
| **Repair** | Retrieves missing shreds/slices from peers |

The high-level lifecycle of a block:
```
Leader creates block
  → Rotor disseminates shreds to relay nodes
    → Relay nodes forward shreds to all others
      → Nodes reconstruct slices, store in Blokstor
        → Nodes cast votes → Pool aggregates → certificates formed
          → Block finalized (fast: 1 round, or slow: 2 rounds)
```

---

## 2. The "World Computer" Motivation

A **blockchain** is a "world computer": a distributed, fault-tolerant, tamper-resistant shared computing environment. Unlike a single machine:
- It runs on thousands of nodes connected over the internet.
- No single authority controls it.
- It survives even if some nodes are controlled by attackers.

Alpenglow is designed to make this world computer faster and more efficient.

---

## 3. System Model and Assumptions

### 3.1 Epoch
- Time is divided into **epochs** (numbered e = 1, 2, 3, ...).
- The set of nodes and their stakes are **fixed** within an epoch.
- Changes for epoch `e+1` are decided at the end of epoch `e-1` (two epochs ahead), ensuring all nodes agree on participant sets before an epoch begins.

### 3.2 Nodes
- There are `n` nodes (v1, v2, ..., vn), currently `n ≈ 1,300–1,500` on Solana.
- Each node has: a public key, a stake amount, an IP address and port.
- All this information is **publicly known** (announced via blockchain transactions).
- The protocol can scale, but a practical cap of `nmax = 2,000` is suggested.

### 3.3 Messages
- All messages are **≤ 1,500 bytes** (fits in one UDP datagram).
- Transport: **QUIC-UDP** or **UDP with per-pair MAC**.
- Symmetric keys are derived from public keys via a key exchange protocol.
- Broadcast = a node loops and sends one-by-one to all n-1 others; total delay still dominated by network delay.

### 3.4 Stake
- Each node `vi` has stake fraction `ρi > 0`, with `Σρi = 1`.
- Stake is fixed per epoch.
- Stake determines: voting weight, fee earnings, and expected outgoing bandwidth contribution.

### 3.5 Time and Clocks
- Each node has its own local clock; **no global synchronization required**.
- Clock drift (e.g., 50 ppm) is absorbed by padding timeouts.
- **Slots** are numbered integers (no wall-clock agreement needed).
- A slot's start/end can differ by local time across nodes — this is fine.

### 3.6 Slots and Leaders
- Each epoch has `L` slots (e.g., `L = 18,000`).
- Each slot `s` has exactly one **designated leader**: `leader(s)`.
- The leader schedule is determined by a **threshold verifiable random function (TVRF)** evaluated before the epoch, making it publicly known but unpredictable in advance.
- Each leader is responsible for a **leader window** of consecutive slots (e.g., 4 slots).

### 3.7 Timeouts
- A global parameter `∆` is the **maximum network delay** between any two correct nodes in synchronous operation (conservatively set to `∆ ≈ 400 ms`).
- Timeouts are *local*: each node measures durations from its own clock.
- Because Alpenglow is **partially synchronous**, timeouts cannot break safety — they only affect liveness.

### 3.8 Adversary Model
- **Byzantine nodes**: can behave arbitrarily (lie, drop messages, collude).
- Byzantine stake < 20% (Assumption 1).
- Up to 20% more stake can be **crashed** (offline, not malicious) under Assumption 2.
- The adversary is **static** within an epoch (does not corrupt new nodes mid-epoch).
- Even if the adversary fully controls the network (delays/inspects/reorders messages), **safety is never violated**.

### 3.9 Partial Synchrony (GST Model)
- Before an unknown time **GST** (Global Stabilization Time), messages can be delayed arbitrarily.
- After GST, all messages sent at time `tm` arrive by `max(GST, tm) + ∆`.
- **Safety**: always holds, regardless of delays.
- **Liveness**: guaranteed only after GST (i.e., in synchronous periods).

### 3.10 Network Delay Variable `δ`
- `δ` is the *actual* (variable, unknown) message delay between correct nodes — much smaller than `∆`.
- `δθ` = time for a stake-weighted fraction `θ` of nodes to all send each other messages.
- Finalization time = `min(δ80%, 2·δ60%)`.

### 3.11 Correctness Guarantees
- **Safety**: If a correct node finalizes block `b` in slot `s`, then any block `b'` finalized in any slot `s' ≥ s` by any correct node must be a *descendant* of `b`. (No two conflicting blocks can both be finalized.)
- **Liveness**: In any sufficiently long synchronous period, correct nodes finalize new blocks produced by correct leaders.

---

## 4. Fault Tolerance — The "20+20" Design

### Classic vs. Alpenglow Fault Tolerance

| Model | Byzantine Tolerance | Total Fault Tolerance |
|---|---|---|
| Classic BFT (3f+1) | < 33% | < 33% |
| Alpenglow (5f+1) | < 20% | < 40% |

### Why Deviate from the Classic 33% Bound?
- At blockchain scale (thousands of nodes), a 20% byzantine attack requires **billions of USD** in stake.
- Misbehavior is **punishable** (slashing), making large byzantine attacks economically irrational.
- In practice, large-scale faults are accidental: misconfigurations, bugs, power/network outages — i.e., **crash faults**, not byzantine.
- The 5f+1 paradigm (from [DGV04] and [MA06]) exploits this reality.

### Assumption 1 (Standard — Used for Safety and Liveness Proofs)
> Byzantine nodes control **< 20%** of stake. The remaining **> 80%** are correct.

### Assumption 2 (Extended Crash Resilience)
> Byzantine nodes control **< 20%** of stake. An additional **≤ 20%** may crash. The remaining **> 60%** are correct.

### Assumption 3 (Rotor Non-Equivocation — Used With Assumption 2)
> If a correct node receives a full block `b` via Rotor for slot `s`, any other correct node that also receives a full block via Rotor for slot `s` receives the **same block `b`**.

This assumption holds automatically when the leader is correct or crashed (a correct/crashed leader produces at most one block per slot). It can be violated only by a *malicious* leader attempting to send different data to different parts of the network.

---

## 5. Performance Metrics

### 5.1 Finalization Latency
After a block is distributed, it is finalized in:
```
min(δ₈₀%, 2·δ₆₀%) time
```
- **1-round (fast) path**: 80% of stake casts notarization votes → fast-finalization certificate.
- **2-round (slow) path**: 60% notarize → notarization certificate → then 60% cast finalization votes → finalization certificate.
- Both paths run **concurrently**; whichever completes first wins.
- Nodes geographically close to each other may complete the 2-round path faster than the 1-round path that waits for the globally distributed 80%.

### 5.2 Throughput
- Rotor uses **total available bandwidth asymptotically optimally**.
- No single leader bottleneck: bandwidth is distributed proportionally to stake across relay nodes.

### 5.3 Simplicity
- Simpler protocols are easier to reason about, implement, audit, and upgrade.
- Alpenglow inherits simplicity from the **Simplex** protocol family.

---

## 6. Cryptographic Primitives Used

### 6.1 Hash Function
- Collision-resistant, e.g., **SHA-256**.

### 6.2 Digital Signatures
- Standard non-forgeable signatures. Every node knows every other node's public key.

### 6.3 Aggregate Signatures
- Multiple signatures on the **same message** from different signers can be combined into one short **aggregate (multi-)signature**.
- Implementation: **BLS signatures** (Boneh-Lynn-Shacham).
- This lets certificates fit into short messages even with `n ≤ nmax = 2,000` nodes.

### 6.4 Erasure Code — `(Γ, γ)` Reed-Solomon
- Parameters: `Γ ≥ γ ≥ 1` (total shreds, data shreds).
- Encode message `M` of size `m` → vector of `Γ` data pieces, each of size `m/γ + O(log Γ)`.
- **Any `γ` of the `Γ` pieces** suffice to reconstruct `M`.
- Data expansion ratio: `κ = Γ/γ` (e.g., κ=2 means 64 total shreds for 32 data shreds).

### 6.5 Merkle Tree
- Commits to a vector `(d1, ..., dΓ)` using a binary hash tree.
- Root `r` is the commitment.
- Validation path `πi` for position `i`: the sibling hashes along the path from `hash(di)` to root `r`.
- Verification: recompute hashes up the path; check root matches `r`.
- Collision resistance ensures no `d'i ≠ di` can have a valid proof for position `i`.

### 6.6 Encode / Decode Functions
**encode(M)**:
1. Erasure-code `M` into `(d1, ..., dΓ)`.
2. Build Merkle tree; root = `r`.
3. Return `(r, {(di, πi)}i∈{1,...,Γ})`.

**decode(r, {(di, πi)}i∈I)** where `|I| = γ`:
1. Verify each `di` is valid data at position `i` for root `r`.
2. Reconstruct `M'` from the γ pieces.
3. Re-encode `M'` → `(d'1, ..., d'Γ)`, rebuild Merkle tree with root `r'`.
4. If `r' = r`: return `M'`. If `r' ≠ r`: **fail** (root was maliciously constructed; no set of γ pieces with this root can decode).
5. This pass/fail guarantee ensures Byzantine leaders cannot create ambiguous shreds.

---

## 7. Data Structures: Shred, Slice, Block

### Hierarchy
```
Block b (slot s)
  ├── Slice 1  (Merkle root r₁, payload M₁)
  │     ├── Shred 1 (d₁, π₁)
  │     ├── Shred 2 (d₂, π₂)
  │     └── ... Shred Γ (dΓ, πΓ)
  ├── Slice 2  (Merkle root r₂, payload M₂)
  │     └── ...
  └── Slice k  (Merkle root rₖ, payload Mₖ, flag zₖ=1)
```
Block hash = root of a second Merkle tree whose leaves are r₁, ..., rₖ.

### 7.1 Shred (Definition 1)
Smallest unit; fits in one UDP datagram (≤ 1,500 bytes).

```
Shred = (s, t, i, zt, rt, (di, πi), σt)
```
| Field | Meaning |
|---|---|
| `s` | Slot number |
| `t` | Slice index |
| `i` | Shred index within slice |
| `zt ∈ {0,1}` | Flag: is this the last slice? |
| `di` | Data piece at position `i` |
| `πi` | Merkle path for `di` relative to root `rt` |
| `σt` | Leader's signature on `Slice(s, t, zt, rt)` |

### 7.2 Slice (Definition 2)
The input/output unit of Rotor. Reconstructed from any `γ` of the `Γ` shreds.

```
Slice = (s, t, zt, rt, Mt, σt)
```
| Field | Meaning |
|---|---|
| `s` | Slot number |
| `t` | Slice index |
| `zt` | Last-slice flag |
| `rt` | Merkle root of this slice's shreds |
| `Mt` | Decoded payload of the slice |
| `σt` | Leader's signature |

### 7.3 Block (Definition 3)
Sequence of all slices for one slot. Used for voting and consensus.

```
Block b = { (s, t, zt, rt, Mt, σt) } for t = 1 to k
```
- `zk = 1` (last slice flag set on final slice), `zt = 0` for `t < k`.
- Block data `M = M1 || M2 || ... || Mk` (concatenation).
- Block contains `slot(parent(b))` and `hash(parent(b))` — the chain link.
- Blocks have limits: max byte size, max execution time.

### 7.4 Block Hash (Definition 4)
```
hash(b) = root of Merkle tree T where:
  - T is a complete full binary tree with m leaves (m = smallest power of 2 ≥ k)
  - Leaves 1..k = r₁, ..., rₖ (the slice Merkle roots)
  - Remaining leaves = ⊥ (empty)
```
This double-Merkle construction means: hash(b) binds to all slice roots, which in turn bind to all shreds.

### 7.5 Ancestor / Descendant (Definition 5)
- Ancestor of `b`: `b` itself, `b`'s parent, `b`'s grandparent, etc. (following parent links).
- `b'` is a descendant of `b` if `b` is an ancestor of `b'`.
- A block is its own ancestor and descendant.

---

## 8. Rotor — Block Dissemination

### 8.1 Goal
Broadcast a block from the leader to all nodes with:
- **Low latency** (between δ and 2δ)
- **Balanced bandwidth** (proportional to stake, no leader bottleneck)
- **Fault tolerance** (survives crashed/faulty relays)
- **Streaming** (leader doesn't wait for the full block before sending)

### 8.2 Structure
```
For each slice t:
  Leader generates Γ shreds (Reed-Solomon encoded)
  Leader builds Merkle tree over shred hashes, signs root
  Leader sends shred i → relay node i (sampled by stake)
  Each relay node broadcasts its shred to ALL other nodes
    (in decreasing stake order; next leader gets it first)
```

### 8.3 Shred Verification
- **First shred of a slice**: verify Merkle path + leader signature → store root `rt`.
- **Subsequent shreds of same slice**: verify Merkle path against stored `rt` (no signature check needed — cheaper).
- After collecting γ valid shreds: decode slice, then re-generate the missing Γ-γ shreds for others.

### 8.4 Definition 6 — Rotor Success
> Rotor is **successful** for slot `s` if: the leader of `s` is correct, **and** at least `γ` of the `Γ` relay nodes are correct.

### 8.5 Lemma 7 — Rotor Resilience
> If the leader is correct and `κ = Γ/γ > 5/3` (i.e., over-provisioning > 67%), then as `γ → ∞`, Rotor succeeds with probability 1.

**Proof sketch**: Relays are sampled by stake. Byzantine fraction < 40%. Expected correct relays > 60% · Γ > 60% · (5γ/3) = γ. By Chernoff bound, ≥ γ correct relays arrive with probability → 1.

**Practical parameter**: κ = 2 (Γ = 64, γ = 32) is the suggested setting.

### 8.6 Lemma 8 — Rotor Latency
> If Rotor succeeds, network latency ≤ 2δ. With high over-provisioning (κ → ∞, n → ∞), latency approaches δ.

**Proof sketch**:
- Path 1: Leader → relay (δ) → relay → receiver (δ) = **2δ** (pessimistic).
- Path 2: With many relays, some are geographically *between* leader and receiver. In extreme, these relays add no overhead → total = **δ** (optimistic).

Simulation with Solana's real stake distribution shows: with κ=10 (Γ=320, γ=32), latency approaches the single-δ lower bound.

### 8.7 Lemma 9 — Bandwidth Optimality
> With a leader sending at rate `βℓ ≤ β̄` (average bandwidth), Rotor delivers block data at rate `βℓ/κ` per node. Up to the expansion factor κ, this is **optimal**.

**Proof**:
- Node `vi` is relay for `Γρi` shreds in expectation → receives data from leader at rate `ρi·βℓ`.
- `vi` must forward to `n-2` nodes → needs outgoing rate `ρi·βℓ·(n-2)`.
- `vi`'s bandwidth = `n·β̄·ρi ≥ ρi·βℓ·(n-2)` since `βℓ ≤ β̄`. ✓
- Upper bound: can't exceed `βℓ` (only leader knows data) or `β̄` (total sending capacity). So κ overhead is unavoidable. ✓

### 8.8 Safety Note on Rotor
Attacks on Rotor can only affect **liveness** (slow down dissemination), never **safety** (can't cause conflicting blocks to be finalized). Safety is guaranteed by Votor even under asynchrony.

---

## 9. Blokstor — Block Storage

### 9.1 Purpose
Collects and stores shreds/slices/blocks received via Rotor. Manages which block is "the" block for each slot.

### 9.2 Definition 10 — Blokstor Rules
When a shred `(s, t, i, zt, rt, (di, πi), σt)` arrives, it is added to Blokstor **only if all hold**:
1. No shred with indices `(s, t, i)` already stored.
2. `(di, πi)` is valid data at position `i` for Merkle root `rt`.
3. `σt` is a valid signature of `Slice(s, t, zt, rt)` by `leader(s)`.

### 9.3 Block Event
When Blokstor receives the **first complete block `b`** for a slot, it emits:
```
Block(slot(b), hash(b), hash(parent(b)))
```
This event triggers Votor (Algorithm 1).

### 9.4 Additional Storage Rules
- Blokstor stores only the **first** complete block received for a slot (normally).
- Exception: Before `SafeToNotar(slot(b), hash(b))` is emitted, any block `b` that could potentially be notarized must also be stored (via Repair).
- After a block is finalized, only that specific block needs to be stored for that slot.

---

## 10. Votes and Certificates

### 10.1 Vote Types (Table 5)
All votes are signed by the voting node `v`.

| Vote Type | Object Signed | Purpose |
|---|---|---|
| **Notarization Vote** | `NotarVote(slot(b), hash(b))` | First-round "I support this block" |
| **Notar-Fallback Vote** | `NotarFallbackVote(slot(b), hash(b))` | Second-round "I saw enough support for this block" |
| **Skip Vote** | `SkipVote(s)` | "I think this slot should be skipped" |
| **Skip-Fallback Vote** | `SkipFallbackVote(s)` | Second-round skip vote |
| **Finalization Vote** | `FinalVote(s)` | "I saw enough notarization → finalize" |

### 10.2 Certificate Types (Table 6)
Certificates aggregate votes from multiple nodes using aggregate signatures.

| Certificate Type | Aggregates | Threshold (Σ = cumulative stake) |
|---|---|---|
| **Fast-Finalization Cert.** | NotarVote | Σ ≥ 80% |
| **Notarization Cert.** | NotarVote | Σ ≥ 60% |
| **Notar-Fallback Cert.** | NotarVote OR NotarFallbackVote | Σ ≥ 60% |
| **Skip Cert.** | SkipVote OR SkipFallbackVote | Σ ≥ 60% |
| **Finalization Cert.** | FinalVote | Σ ≥ 60% |

**Key implication**: Fast-Finalization (80%) ⊃ Notarization (60%) ⊃ Notar-Fallback (60%). If a node generates a Fast-Finalization Cert, it also has a Notarization Cert and a Notar-Fallback Cert.

### 10.3 Two Finalization Paths
```
PATH 1 (Fast, 1 round):
  ≥80% stake cast NotarVotes → Fast-Finalization Certificate → block finalized immediately

PATH 2 (Slow, 2 rounds):
  ≥60% stake cast NotarVotes → Notarization Certificate
    → nodes cast FinalVotes
      → ≥60% FinalVotes → Finalization Certificate → block finalized
```

---

## 11. Pool — Vote Aggregation Store

### 11.1 Purpose
Every node maintains a Pool: a local store of all votes and certificates for every slot.

### 11.2 Definition 12 — What Pool Stores (per slot, per node)
- The **first** notarization vote OR skip vote received (one or the other, not both).
- **Up to 3** notar-fallback votes received.
- The **first** skip-fallback vote received.
- The **first** finalization vote received.

The "first received" policy and limits prevent memory exhaustion from spam.

### 11.3 Definition 13 — Certificate Generation and Broadcast
When Pool accumulates enough votes to meet a certificate threshold (Table 6):
1. **Generate** the certificate.
2. **Broadcast** it to all other nodes.
3. **Store** it (one per type per block/slot).

### 11.4 Definition 14 — Finalization
A block is finalized in two ways:
- **Fast-finalized**: Pool holds a Fast-Finalization Certificate for block `b` → `b` is finalized.
- **Slow-finalized**: Pool holds a Finalization Certificate for slot `s` → the unique notarized block in slot `s` is finalized.

**In both cases**: all ancestors of the finalized block are finalized first (recursively).

### 11.5 Definition 15 — Pool Events (inputs to Votor Algorithm 1)
- **BlockNotarized(slot(b), hash(b))**: Pool holds a Notarization Certificate for block `b`.
- **ParentReady(s, hash(b))**: 
  - `s` is the **first slot** of a leader window.
  - Pool holds a notarization or notar-fallback certificate for some previous block `b`.
  - Pool holds skip certificates for every slot `s'` with `slot(b) < s' < s`.
  - Meaning: "We know the parent chain up to `b`; the new leader can build on top of `b` starting at slot `s`."

### 11.6 Definition 16 — Fallback Events (SafeToNotar / SafeToSkip)
These events signal when it is safe to cast second-round fallback votes.

Let `notar(b)` = cumulative stake of notarization votes for `b` in Pool.  
Let `skip(s)` = cumulative stake of skip votes for slot `s` in Pool.

**SafeToNotar(s, hash(b))** is emitted when (node already voted in slot `s` but NOT for `b`, AND):
```
notar(b) ≥ 40%
  OR
(skip(s) + notar(b) ≥ 60% AND notar(b) ≥ 20%)
```
- First slot of window: emit immediately.
- Non-first slot: first retrieve block `b` via Repair, identify parent, wait for parent's notar-fallback cert, then emit.

**SafeToSkip(s)** is emitted when (node already voted in slot `s` but NOT to skip, AND):
```
skip(s) + Σ_b notar(b) - max_b notar(b) ≥ 40%
```
Intuition: No single block has enough votes to be fast-finalized, so it's safe to skip.

---

## 12. Votor — The Voting Algorithm

### 12.1 Overview
Votor is the heart of the consensus logic. It listens to events from Pool and Blokstor, casts votes, and determines finalization.

### 12.2 Definition 17 — Timeouts
When `ParentReady(s, ...)` is emitted for the first slot `s` of a leader window, Votor schedules timeouts for all slots in the window:
```
Timeout(i) fires at: clock() + ∆_timeout + (i - s + 1) · ∆_block
```
- `∆_block = 400ms` (block time per slot)
- `∆_timeout = (1∆ + 2∆)` — conservative upper bound covering: time for leader to observe certs + Rotor latency

The `(i - s + 1)` factor staggers timeouts across the window. Slot `s` fires at `∆_timeout + ∆_block`, slot `s+1` fires at `∆_timeout + 2·∆_block`, etc.

### 12.3 Definition 18 — Votor State (per slot)
Persistent flags added to `state[s]`:

| Flag | Meaning |
|---|---|
| `ParentReady(hash(b))` | Pool emitted ParentReady for slot `s` with parent `b` |
| `Voted` | Node cast a notarization OR skip vote in slot `s` |
| `VotedNotar(hash(b))` | Node cast a notarization vote for block `b` in slot `s` |
| `BlockNotarized(hash(b))` | Pool holds a notarization cert for block `b` in slot `s` |
| `ItsOver` | Node cast the finalization vote in slot `s`; no more votes |
| `BadWindow` | Node cast a skip, skip-fallback, or notar-fallback vote |

Also: `pendingBlocks[s]` — a block waiting to be re-checked for notarization once conditions change.

### 12.4 Algorithm 1 — Votor Event Loop (single-threaded)

```
upon Block(s, hash, hashparent):
  if tryNotar(Block(s, hash, hashparent)):
    checkPendingBlocks()
  elif Voted ∉ state[s]:
    pendingBlocks[s] ← Block(s, hash, hashparent)   # save for later

upon Timeout(s):
  if Voted ∉ state[s]:
    trySkipWindow(s)    # missed block → skip all unvoted slots in window

upon BlockNotarized(s, hash(b)):
  state[s] ← state[s] ∪ {BlockNotarized(hash(b))}
  tryFinal(s, hash(b))  # maybe we can now cast finalization vote

upon ParentReady(s, hash(b)):
  state[s] ← state[s] ∪ {ParentReady(hash(b))}
  checkPendingBlocks()
  setTimeouts(s)        # start all timers for this leader window

upon SafeToNotar(s, hash(b)):
  trySkipWindow(s)      # skip unvoted earlier slots in window
  if ItsOver ∉ state[s]:
    broadcast NotarFallbackVote(s, hash(b))
    state[s] ← state[s] ∪ {BadWindow}

upon SafeToSkip(s):
  trySkipWindow(s)
  if ItsOver ∉ state[s]:
    broadcast SkipFallbackVote(s)
    state[s] ← state[s] ∪ {BadWindow}
```

### 12.5 Algorithm 2 — Helper Functions

**tryNotar(Block(s, hash, hashparent))**:
```
if Voted ∈ state[s]: return false   # already voted this slot

firstSlot = (s is first slot of leader window)

if (firstSlot AND ParentReady(hashparent) ∈ state[s])
   OR (NOT firstSlot AND VotedNotar(hashparent) ∈ state[s-1]):
     broadcast NotarVote(s, hash)
     state[s] ← state[s] ∪ {Voted, VotedNotar(hash)}
     pendingBlocks[s] ← ⊥
     tryFinal(s, hash)
     return true

return false
```

**Condition explanation**:
- For the **first slot** of a window: need `ParentReady` (parent chain is established).
- For **subsequent slots** within the same window: need to have voted `NotarVote` for the *previous slot's block* (chain continuity within the window).

**tryFinal(s, hash(b))**:
```
if BlockNotarized(hash(b)) ∈ state[s]
   AND VotedNotar(hash(b)) ∈ state[s]
   AND BadWindow ∉ state[s]:
     broadcast FinalVote(s)
     state[s] ← state[s] ∪ {ItsOver}
```
A node casts a FinalVote only if:
1. It personally voted to notarize `b`.
2. It has seen a notarization certificate for `b` (60% agree).
3. It hasn't entered the "bad window" (no skip/fallback votes cast).

**trySkipWindow(s)**:
```
for each k in windowSlots(s):
  if Voted ∉ state[k]:
    broadcast SkipVote(k)
    state[k] ← state[k] ∪ {Voted, BadWindow}
    pendingBlocks[k] ← ⊥
```
Skip all unvoted slots in the window (triggered by timeout or SafeToSkip).

**checkPendingBlocks()**:
```
for each s with pendingBlocks[s] ≠ ⊥ (in increasing s order):
  tryNotar(pendingBlocks[s])
```
Re-check blocks that arrived before their conditions were met.

### 12.6 Voting Rules Summary
```
A correct node casts EXACTLY ONE of these per slot:
  - NotarVote (supports the block)
  - SkipVote (skips the slot)

After that initial vote, it may ALSO cast (at most once each):
  - NotarFallbackVote (if SafeToNotar fires and ItsOver not set)
  - SkipFallbackVote (if SafeToSkip fires and ItsOver not set)
  - FinalVote (if BlockNotarized fires and conditions met)

Key mutual exclusions:
  - Once ItsOver is set (after FinalVote), NO more votes cast
  - Once BadWindow is set (skip/fallback), NO FinalVote can be cast
  - These two flags are mutually exclusive by design
```

---

## 13. Block Creation (Leader Logic)

### 13.1 Overview
The leader `v` of a window starting at slot `s` produces blocks for all slots `windowSlots(s)`.

### 13.2 When Can the Leader Build?
After `ParentReady(s, hash(bp))` is emitted, `v` knows that all correct nodes will eventually receive the certificate chain leading to `bp`, and will accept a block with `bp` as parent.

### 13.3 Algorithm 3 — Block Creation (Optimistic)
```
wait until: block bp in slot s-1 received OR ParentReady(hash(bp)) ∈ state[s]
b ← generate block with parent bp in slot s
t ← 1  (slice index)

# Optimistic phase: produce slices BEFORE ParentReady is confirmed
while ParentReady(.) ∉ state[s]:
  Rotor(slice t of b)
  t ← t + 1

# Check: did we need to change parent?
if ParentReady(hash(bp)) ∉ state[s]:
  bp ← any b' such that ParentReady(hash(b')) ∈ state[s]
  b ← generate block with parent bp in slot s, starting at slice index t
  # slices 1..t-1 are IGNORED for execution

start ← clock()

# Normal phase: produce rest of block within ∆_block
while clock() < start + ∆_block:
  Rotor(slice t of b)
  t ← t + 1

# Continue with next slots in window
for s' = s+1, s+2, ...:
  b ← generate block with parent b in slot s'
  Rotor(b) over ∆_block
```

### 13.4 Key Design Points
- **Optimistic start**: Leader begins building on the most recent block it received, without waiting for the notarization certificate. If the parent changes (e.g., the previous leader's block ends up not being chosen), the leader switches parents in a later slice.
- **Parent switch**: Only allowed once, only in the first slot of the window. Slices sent before the switch are discarded for execution purposes.
- **Chain building within window**: `b0` is built on `bp`, `b1` on `b0`, `b2` on `b1`, etc. The leader produces all window slots back-to-back without gaps.
- **Fast handoff**: The next leader starts producing as soon as it receives the last slice of the previous leader's block — no waiting for certificates.

---

## 14. Repair — Fetching Missing Blocks

### 14.1 When Is Repair Needed?
After Pool obtains a Notarization or Notar-Fallback certificate for block `b`, the node must have block `b` in Blokstor. If it's missing, Repair fetches it.

### 14.2 Definition 19 — Repair API
All functions contact a randomly sampled node `v` (sampled by stake):

| Function | Returns |
|---|---|
| `sampleNode()` | A random node `v` chosen by stake |
| `getSliceCount(hash(b), v)` | `(k, rk, πk)` — number of slices `k` in `b`, with proof that `rk` is the last non-empty leaf |
| `getSliceHash(t, hash(b), v)` | `(rt, πt)` — Merkle root for slice `t` with proof |
| `getShred(s, t, i, rt, v)` | The shred `(s, t, i, zt, rt, (di, πi), σt)` |

All functions return `⊥` if the data provided by `v` fails verification.

### 14.3 Algorithm 4 — Repair Block b
```
k ← ⊥
while k = ⊥:
  (k, rk, πk) ← getSliceCount(hash(b), sampleNode())

for t = 1 to k (concurrently):
  while rt = ⊥:
    (rt, πt) ← getSliceHash(t, hash(b), sampleNode())

  for each shred index i (concurrently):
    while shred (s,t,i) missing:
      shred ← getShred(s, t, i, rt, sampleNode())
      store shred if valid
```

**Design**: Concurrent fetching of all slices and shreds. Nodes are sampled by stake (honest nodes are more likely to be selected). Keeps retrying with different nodes until valid data is received.

---

## 15. Safety Proofs

Safety means: no two different blocks can be finalized in the same slot or conflict in the chain.

### Lemma 20 — One Vote Per Slot
> A correct node casts **exactly one** notarization vote OR skip vote per slot.

**Proof**: Both vote types check `Voted ∉ state[s]` before casting. After casting, `Voted` is added. The flag is never removed. ✓

### Lemma 21 — Fast-Finalization Exclusivity
> If block `b` is fast-finalized (≥80% NotarVotes for `b`):
> (i) No other block `b' ≠ b` in the same slot can be notarized (needs 60%; only <40% remain).
> (ii) No block `b' ≠ b` can be notar-fallback certified (SafeToNotar conditions require >20% notarizing `b'`; only <40% available).
> (iii) No skip certificate for that slot exists (SafeToSkip needs >40% skip votes; not possible).

### Lemma 22 — FinalVote and Fallback Are Mutually Exclusive
> If a correct node cast a FinalVote in slot `s`, it cannot cast a notar-fallback or skip-fallback vote, and vice versa.

**Proof**: `ItsOver` (set on FinalVote) blocks fallbacks. `BadWindow` (set on fallbacks) blocks FinalVote. These are set before the respective vote is broadcast. ✓

### Lemma 23 — 40% Notarization Locks the Block
> If correct nodes with >40% stake notarize block `b` in slot `s`, no other block `b'` can be notarized in slot `s`.

**Proof**: Notarization requires 60% stake. Combined with the >40% already locked on `b`, there's overlap → some node would have to vote twice → contradicts Lemma 20. ✓

### Lemma 24 — At Most One Notarized Block Per Slot
> At most one block can be notarized in a given slot.

Follows from Lemma 23 (a notarized block has >40% correct support by Assumption 1).

### Lemma 25 — Finalized ⟹ Notarized
> If a block is finalized by a correct node, it is also notarized.

- Fast-finalized → 80% NotarVotes → >60% correct → notarization cert. ✓
- Slow-finalized → 60% FinalVotes → some correct nodes observed notarization cert → that cert exists. ✓

### Lemma 26 — Slow-Finalization Exclusivity
Same guarantees as Lemma 21 but for slow-finalization (similar proof using >40% correct FinalVoters).

### Lemma 27 — Certificate ⟹ Some Correct Node Voted
> If a notarization or notar-fallback certificate for `b` exists, some correct node cast a notarization vote for `b`.

**Proof by contradiction**: If no correct node voted for `b`, all SafeToNotar conditions require seeing ≥20% notarizing `b`, but byzantines control <20%, so no correct node emits SafeToNotar, so no notar-fallback votes exist → can't reach 60% threshold for any certificate. ✓

### Lemma 28 — Notarization Implies Ancestor Notarization Within Window
> If a correct node `v` voted to notarize `b` in slot `s`, then for every slot `s' ≤ s` in the same leader window, `v` voted to notarize the ancestor of `b` in slot `s'`.

**Proof**: By induction using the condition in Algorithm 2 line 11: non-first slots require `VotedNotar(hashparent) ∈ state[s-1]`. ✓

### Lemma 29, 30 — Fallback Votes Propagate to Ancestors
If a correct node cast a notar-fallback for `b` in a non-first slot, its parent `b'` also has either >40% correct notarization votes or at least one correct notar-fallback vote.

### Lemmas 31, 32 — Finalized Block Is Ancestor of All Future Notarized Blocks
- Lemma 31: Within the same leader window.
- Lemma 32: Across different leader windows.

Both use the exclusivity lemmas (21, 26) and ancestor lemmas (28, 30) to derive contradictions if a conflicting block were notarized.

### Theorem 1 — Safety
> If any correct node finalizes block `b` in slot `s`, and any correct node finalizes block `b'` in slot `s' ≥ s`, then `b'` is a **descendant of `b`**.

**Proof**: `b'` is notarized (Lemma 25). By Lemmas 31 and 32, `b'` must be a descendant of `b`. ✓

---

## 16. Liveness Proofs

Liveness means: in periods of synchrony with a correct leader, blocks get finalized.

### Lemma 33 — ParentReady Triggers Timeouts
If a correct node emits `ParentReady(s, ...)`, it will schedule `Timeout(k)` for all `k ∈ windowSlots(s)`. (Direct from Algorithm 1.)

### Corollary 34 — Timeout ⟹ ParentReady Was Emitted
If a node sets a timeout for slot `s`, it previously emitted `ParentReady(s', ...)` where `s'` is the first slot of the window. (Follows from Lemma 33.)

### Lemma 35 — Timeouts Force a Vote
If all correct nodes set the timeout for slot `s`, all will cast a notarization or skip vote in slot `s`. (Timeout triggers `trySkipWindow` which casts a skip vote if no notarization vote was cast yet.)

### Lemma 36 — No 40% Notarization ⟹ No ItsOver
If no set of correct nodes with >40% stake notarize the same block in slot `s`, no correct node adds `ItsOver` to `state[s]`.

### Lemma 37 — Timeouts Lead to Skip Certificate or Sufficient Notarization
If all correct nodes set the timeout for slot `s`, either:
- A skip certificate is eventually observed by all, OR
- Correct nodes with >40% stake notarize the same block.

**Proof sketch**: After timeout, all correct nodes (80%+ stake) have voted. If no single block has >40% notarization, then the SafeToSkip condition is met (by arithmetic: skip + all_notar - max_notar ≥ 40%), triggering skip-fallback votes, eventually producing a skip cert. ✓

### Lemma 38 — 40% Notarization ⟹ All See Notar-Fallback Cert
If correct nodes with >40% stake notarize block `b`, all correct nodes will observe a notar-fallback certificate for `b`. (By induction on slot position within window; SafeToNotar is triggered for non-voters; they cast notar-fallback votes.)

### Lemma 39, 40 — Window Completion
Every slot in a window either gets a skip cert or a notar-fallback cert. After a window, all correct nodes emit `ParentReady` for the next window's first slot.

### Lemma 41 — All Timeouts Are Set
By induction: the first timeout leads to the next window's `ParentReady`, which leads to the next timeout. All correct nodes set timeouts for all slots forever.

### Lemma 42 — Synchrony Propagates Timeouts Quickly
After GST: if the first correct node sets the timeout for `s` at time `t`, all correct nodes emit `ParentReady(s, ...)` and set timeouts by time `t + ∆`.

### Theorem 2 — Liveness
> Let `vℓ` be a correct leader for a window starting at slot `s`. Suppose no correct node set timeouts for this window before GST, and Rotor succeeds for all slots in the window. Then all blocks produced by `vℓ` in this window are finalized by all correct nodes.

**Proof sketch (4 steps)**:
1. By Lemma 41, all nodes eventually set the timeout for `s`. Let `t` be when the first correct node does. By Lemma 42, `vℓ` has `ParentReady` by `t+∆`, and finishes transmitting block `k` by `t + ∆ + (k-s+1)·∆_block`. Correct nodes receive block `k` by `t + 3∆ + (k-s+1)·∆_block`.
2. Suppose for contradiction some correct node `v` skips slot `k`. Then `v` skips all slots `k' ≥ k` in the window.
3. Analyze which event caused the first skip. SafeToNotar and SafeToSkip require prior skip votes (circular). Only Timeout(j) for j ≥ k can be the cause.
4. But `Timeout(k)` fires at `t' ≥ t + ∆_timeout + (k-s+1)·∆_block ≥ t + 3∆ + (k-s+1)·∆_block`, which is *after* `v` already received the block and cast a notarization vote. Contradiction. ✓

Therefore, all correct nodes notarize all blocks in the window → fast-finalization cert is produced → all blocks finalized. ✓

---

## 17. Higher Crash Resilience (Assumption 2+3)

### 17.1 Intuition
Under Assumption 1, Alpenglow requires >80% of stake correct. Under Assumption 2, only >60% needs to be correct (20% additional crash budget), but only when Assumption 3 also holds.

### 17.2 Safety Under Assumption 2
Safety is still guaranteed because:
- Crashed nodes behave like nodes with infinite message delay.
- Section 2.9 already proved safety for arbitrarily delayed messages.
- Therefore, safety holds regardless of how many nodes are crashed (as long as byzantine < 20%).

### 17.3 Liveness Under Assumptions 2+3
The liveness proofs break at Definition 16 (SafeToNotar/SafeToSkip conditions) because only 60% of stake is reliably voting, not 80%.

**Fix with Assumption 3**: If two correct nodes can't reconstruct different blocks in the same slot:
- Either ≥20% of correct nodes notarized some block `b` → SafeToNotar is triggered (condition: `notar(b) ≥ 20%`).
- Or no single block has significant notarization → SafeToSkip is triggered (skip(s) ≥ 40% since only 60% online and none above 20% for any block).

### Corollary 43
Theorem 2 (liveness) holds under Assumptions 2+3 instead of Assumption 1.

### 17.4 When Can Assumption 3 Be Violated?
Only if a **malicious leader** sends different blocks (different Merkle roots for same slice index) to different parts of the network. Detection: if a correct node receives two shreds with different Merkle roots for the same `(s, t)`, it refuses to vote for the block.

### 17.5 Example Attack (Example 44)
- Two clusters A and B (31% stake each), adversary 18%, crashed 20%.
- Adversary sends block `bA` shreds to A's relays, block `bB` shreds to B's relays.
- Due to latency between A and B, each cluster reconstructs its block before seeing the other's shreds.
- Assumption 3 violated. With 20% crashed, neither cluster reaches 60% notarization → protocol could stall.
- **Mitigation**: With uniform node distribution, it's harder to arrange two geographically isolated large groups that each receive enough shreds before seeing cross-group shreds.

---

## 18. Smart Sampling (PS-P)

### 18.1 Motivation
Standard stake-weighted IID (Independent and Identically Distributed) sampling has high variance — the adversary could get lucky and control more than γ relay slots. Better sampling reduces this probability.

### 18.2 Definition 45 — Partitioning
A **partitioning** of stakes into `k` bins is a mapping `p: {1..k} × {1..n} → [0,1]` such that:
- Each node's stake is fully assigned: `Σ_b p(b,v) = ρv` for all `v`.
- Each bin is exactly full: `Σ_v p(b,v) = 1/k` for all `b`.

### 18.3 Definition 46 — Partition Sampling (PS-P)
Given `Γ` samples to draw:
1. For each node with `ρi > 1/Γ`: assign `⌊ρi·Γ⌋` bins deterministically to that node. Remaining stake `ρ'i = ρi - ⌊ρi·Γ⌋/Γ < 1/Γ`.
2. Calculate a partitioning of the remaining `k = Γ - Σ⌊ρi·Γ⌋` bins using algorithm P.
3. From each bin, sample one node proportional to their fractional stake in that bin.

**Simple P example**: Randomly order nodes, cut after every `1/k` relative stake.

### 18.4 Lemma 47 — PS-P ≤ IID for Adversary
> For any stake distribution with all `ρi < 1/Γ`, adversary being sampled ≥ γ times in PS-P is at most as likely as in IID.

**Proof**: In PS-P, sampling is Poisson-binomial (Γ independent Bernoulli trials with possibly different probabilities). The adversary's probability is maximized when equally distributed across bins → Binomial(Γ, ρA) = same as IID. Binomial maximizes variance among Poisson-binomial distributions [Hoeffding 1956], so all other distributions give lower adversary probability. ✓

### 18.5 Theorem 3 — PS-P ≤ FA1-IID
> For any stake distribution, adversary being sampled ≥ γ times in PS-P is at most as likely as in FA1-IID.

**Proof**: Step 1 of PS-P is equivalent to applying FA1 (which handles large-stake nodes deterministically). Then Lemma 47 applies to the remaining smaller-stake nodes. ✓

### 18.6 Practical Result (Figure 9)
With γ=32, Γ=64, and Solana's epoch 780 stake distribution:
- **PS-P** achieves dramatically lower failure probability than both FA1-IID and stake-weighted IID.
- PS-P is also better than Turbine's current approach.
- At 40% crashes, PS-P failure probability is near `10^-8` while IID is much higher.

---

## 19. Voting vs. Execution Models

### 19.1 Eager (Synchronous) Execution — Current Solana
- Leader executes the block before sending it.
- Validators execute the block before voting for it.
- With slice pipelining: execute slice `t-1` while transmitting slice `t`.
- Adds time to the critical path (must execute last slice before voting).

### 19.2 Lazy (Asynchronous) Execution
- Vote on a block before executing it.
- Requires trustworthy Compute Unit (CU) bounds on transactions.
- CU limits on blocks ensure execution finishes in bounded time.
- Risk: if CU bounds are unrealistically optimistic, execution delays can grow unbounded.

### 19.3 Distributed Execution
- Validators use multiple co-located machines for executing transactions in parallel.
- Allows scaling to higher transaction throughput without over-provisioning.
- Supports elasticity (scaling up during traffic surges).
- Examples: **Pilotfish** [Kni+25] and **Stingray** [SSK25].

---

## 20. Asynchrony in Practice — Joining & Standstill

### 20.1 Joining / Rebooting Nodes
A node that was offline and missed messages needs to re-sync:
1. Find a **finalization certificate** for some block `b` in slot `s` (fast-finalization cert, OR finalization cert + notarization cert for the same slot).
2. Retrieve block `b` via Repair.
3. Follow parent links back to retrieve all missing ancestors.
4. Emit `ParentReady(s', b')` for the appropriate future slot to rejoin the protocol.

**Key insight**: No vote/certificate messages for slots < `s` are needed. Safety guarantees any future finalized block is a descendant of `b`.

### 20.2 Standstill Detection and Recovery
Triggered when: no new slots are finalized for `∆_standstill ≈ 10 seconds`.

Recovery procedure:
1. Each node broadcasts the **finalization certificate** for the highest finalized slot `s` it knows.
2. For all slots `s' > s`, broadcasts all certificates and own votes it observed.
3. This re-floods the network with all necessary state to resume liveness.

---

## 21. Dynamic Timeouts

### 21.1 Why Needed?
Each epoch must have at least one finalized block (to anchor the next epoch's state). If the network is deeply disrupted, static timeouts may be too short.

### 21.2 Mechanism
If a node does not observe a finalized block for `∆_standstill ≈ 10 seconds` of consecutive leader windows:
- **Increase timeout by `ε ≈ 5%`** per leader window thereafter.

Properties:
- **No coordination needed**: Each node extends independently.
- **Exponential growth**: `5%` per window → timeouts quickly exceed any extraordinary network delay.
- **Immediate recovery**: As soon as finalized blocks are seen again, return to standard timeouts. No coordination needed for recovery either.
- **Guaranteed finalization per epoch**: With exponentially growing timeouts, eventually every network disruption is outlasted.

---

## 22. Protocol Parameters

| Parameter | Symbol | Value |
|---|---|---|
| Blocks per leader window | `w` | 4 |
| Data shreds per slice | `γ` | 32 |
| Coding shreds per slice | `Γ` | 64 |
| Data expansion ratio | `κ = Γ/γ` | 2 |
| Timeout increase rate | `ε` | 5% |
| Maximum nodes | `nmax` | 2,000 |
| Standstill trigger | `∆_standstill` | 10 sec |
| Block time | `∆_block` | 400 ms |
| Epoch length | `L` | 18,000 slots |
| Current node count | `n` | ≈ 1,300 |
| Max network delay (conservative) | `∆` | ≈ 400 ms |

Note: `L = 18,000` is shorter than Solana's current `L = 432,000`, which would allow stake to change more quickly.

---

## 23. Bandwidth Analysis

### 23.1 Votor Message Sizes (for n=1,500 nodes)
All sizes in bytes:

| Message | BLS Sig | Slot# | Block Hash | Node Bitmap | MAC | Headers | **Total** |
|---|---|---|---|---|---|---|---|
| Notarization Vote | 96 | 8 | 32 | — | 32 | 28 | **196** |
| Notarization Cert. | 96 | 8 | 32 | 188 | 32 | 28 | **384** |
| Fast-Finalization Cert. | 96 | 8 | 32 | 188 | 32 | 28 | **384** |
| Finalization Vote | 96 | 8 | — | — | 32 | 28 | **164** |
| Finalization Cert. | 96 | 8 | — | 188 | 32 | 28 | **352** |
| Skip Vote | 96 | 8 | — | — | 32 | 28 | **164** |
| Skip Cert. | 96 | 8 | — | 188 | 32 | 28 | **352** |

Node Bitmap = 188 bytes encodes which of the 1,500 nodes signed (using a bitset + aggregate BLS signature).

### 23.2 Common Case Bandwidth Per Node
In the common case, per 400ms slot, each node broadcasts:
- 1 NotarVote (196 bytes)
- 1 FinalVote (164 bytes)
- 1 NotarCert (384 bytes)
- 1 FastFinalCert (384 bytes) [largest of the two finalization certs]

Per node to all others: `(196 + 164 + 384 + 384) × 1,500 = 1,692,000 bytes/slot = ~33.84 Mbit/400ms = **32.27 Mbit/s** for Votor messages alone`.

### 23.3 Total Bandwidth Including Rotor
For 500 Mbps goodput (leader sends at 1 Gbps with κ=2):
- Large nodes: hundreds to thousands of Mbps.
- Small nodes: proportionally less.
- Distribution follows the stake distribution closely (by design of Lemma 9).

---

## 24. Latency Simulation Results

Simulation parameters: Solana epoch 780 stake distribution, real-world latency measurements. Block execution time not included.

### 24.1 Stages Measured (Figure 13/14)
- **Network latency** (green): lower bound — time for a message to reach each node from leader.
- **Rotor** (yellow): time for each node to receive γ shreds and reconstruct a slice.
- **Notarization** (red): time for each node to collect 60% stake NotarVotes.
- **Finalization** (blue): time when each node can finalize (fast or slow path, or receiving cert from peer).

### 24.2 Fixed Leader in Zurich (Figure 13)
- ~65% of Solana's stake is within 50ms RTT from Zurich.
- Last node finalizes in **< 270 ms**.
- Median node finalizes in **~115 ms**.
- The distribution is tight — median is close to the fastest nodes.

### 24.3 Random Leader (Figure 14)
- Leader chosen randomly by stake (more representative than fixed Zurich).
- Zurich is more central than average → random leader results are slightly worse.
- Median finalization: **~150 ms**.

---

## 25. Related Work Comparison

### 25.1 Bandwidth: DAG vs. Erasure Coding

| Approach | Bandwidth | Latency |
|---|---|---|
| Classic (PBFT, HotStuff, Tendermint) | Leader bottleneck | Low |
| DAG (Narwhal/Tusk, Bullshark, Mysticeti) | All nodes contribute | Higher (3-5δ) |
| Erasure coding (Turbine, DispersedSimplex, Alpenglow) | All nodes contribute | Low (1-2δ) |

Mysticeti (DAG): Leader block confirmed in 2 rounds (~3δ), but most throughput ordered at 5δ.

A 2025 study [LNS25] confirms erasure-coded approaches (like DispersedSimplex) achieve better latency than DAG approaches.

### 25.2 Latency: Fast/One-Step Consensus

| Protocol | Rounds | Notes |
|---|---|---|
| PBFT | 2 | Classic, O(n²) messages |
| HotStuff | Linear | Responsive, but not one-step |
| DGV / FaB Paxos | 1 or 2 | Introduced fast path; liveness bugs found later [Abr+17] |
| SBFT | 1 | Fixed bugs; optimized for linear messages |
| Banyan | 1+2 parallel | Guarantees min(1,2)-round |
| Alpenglow | 1+2 parallel | + erasure coding for bandwidth |

### 25.3 Kudzu — Academic Sibling [SSV25]
Similar theoretical foundation. Key differences:

| Aspect | Kudzu | Alpenglow |
|---|---|---|
| Model | Permissioned | Proof-of-stake |
| Leader windows | No | Yes (improves throughput) |
| Fast leader handoff | No | Yes |
| Crash resilience | Standard | Higher (Assumption 2+3) |
| Vote timing | On first fragment | After full reconstruction |
| Erasure expansion κ | Must be higher | Can be freely set (κ=2 suggested) |

### 25.4 Hydrangea — Follow-up Work [SKN25]
Proposed after Alpenglow. Parametrizes `n = 3f + 2c + k + 1` for f byzantine + c crash faults.
- To achieve 1-round finalization among 80%: needs f=13%, total tolerated = 33%.
- Alpenglow: f<20%, total tolerated = 40%, but needs Assumption 3 above 20%.
- Hydrangea has a leader bandwidth bottleneck.
- The parametrization idea could potentially be applied to Alpenglow.

---

## 26. Key Innovations Summary

| Innovation | Description |
|---|---|
| **Dual-path finalization** | 1-round (80%) and 2-round (60%) paths run concurrently; finalize in `min(δ₈₀%, 2δ₆₀%)` |
| **20+20 resilience** | Tolerates <20% byzantine + up to 20% crashed (with Assumptions 2+3) |
| **Rotor dissemination** | Erasure-coded, stake-proportional relay network; optimal bandwidth utilization |
| **Leader windows** | Multiple slots per leader; enables streaming and fast handoff between leaders |
| **Optimistic block building** | Leader starts building before parent cert arrives; switches parent atomically if needed |
| **PS-P sampling** | Novel partition-based sampling that reduces adversary relay probability vs. IID and FA1-IID |
| **SafeToNotar/SafeToSkip events** | Precise conditions for when fallback votes are safe; prevents false positives |
| **Dynamic timeouts** | Exponentially growing timeouts during prolonged network disruption; guarantees finalization per epoch |
| **Repair protocol** | Concurrent, stake-weighted random fetching of missing shreds; handles late joiners |
| **Standstill recovery** | Re-broadcast of all known certs/votes after inactivity; restores liveness |
| **Aggregate BLS signatures** | Certificates fit in short messages regardless of n (up to nmax=2,000) |
| **Double-Merkle block hash** | Block hash binds to all slice Merkle roots; efficient authenticity checking per shred |

---

## Appendix: Proof Summary Table

| Theorem/Lemma | Statement | Depends On |
|---|---|---|
| Lemma 20 | One notarization or skip vote per slot | Algorithm 2 structure |
| Lemma 21 | Fast-finalization exclusivity (no conflict) | Lemma 20, Assumption 1 |
| Lemma 22 | FinalVote and fallbacks are mutually exclusive | Algorithm state flags |
| Lemma 23 | >40% notarization locks block | Lemma 20 |
| Lemma 24 | At most one notarized block per slot | Lemma 23, Assumption 1 |
| Lemma 25 | Finalized ⟹ Notarized | Lemma 24 |
| Lemma 26 | Slow-finalization exclusivity | Lemma 24, Assumption 1 |
| Lemma 27 | Certificate ⟹ correct node voted | Assumption 1, Definition 16 |
| Lemma 28 | Notarization propagates to ancestors in window | Algorithm 2 condition, induction |
| Lemmas 29-30 | Fallback votes propagate to ancestors | Lemma 27, 28, Definition 16 |
| Lemmas 31-32 | Finalized block is ancestor of all future notarized blocks | Lemmas 21, 26, 28, 30 |
| **Theorem 1** | **Safety** | Lemmas 25, 31, 32 |
| Lemma 35 | Timeouts force votes | Algorithm 1 |
| Lemma 37 | Timeouts → skip cert or 40% notarization | Lemma 35, 36, Definition 16, Assumption 1 |
| Lemma 38 | 40% notarization → all see notar-fallback cert | Definition 16, induction |
| Lemmas 39-42 | Window completion; all timeouts eventually set | Lemmas 37, 38, 33 |
| **Theorem 2** | **Liveness** | Lemmas 41, 42, Algorithm 3 |
| Corollary 43 | Liveness under Assumptions 2+3 | Theorem 2 proof, Assumption 3 |
| Lemma 47 | PS-P ≤ IID for adversary | Hoeffding 1956 |
| Theorem 3 | PS-P ≤ FA1-IID | Lemma 47, FA1 definition |

---

*End of Alpenglow Complete Technical Reference*  
*Based on: Alpenglow White Paper v1.1, July 22, 2025 — Kniep, Sliwinski, Wattenhofer (Anza)*
