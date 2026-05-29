import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, HelpCircle, Lock, Shield, Cpu, Clock, Network, AlertTriangle } from 'lucide-react';

interface JargonTerm {
  term: string;
  category: 'Cryptography' | 'Consensus' | 'Network' | 'Time & Outage';
  definition: string;
  analogy: string;
  example: string;
  icon: React.ReactNode;
}

export default function JargonBuster() {
  const [filter, setFilter] = useState<'All' | 'Cryptography' | 'Consensus' | 'Network' | 'Time & Outage'>('All');

  const terms: JargonTerm[] = [
    {
      term: "Byzantine Fault (or General)",
      category: "Consensus",
      definition: "A failure mode where nodes can lie, collude, drop messages, or act maliciously.",
      analogy: "A rogue army general who sends conflicting messages to his troops (telling Group A to 'attack' and Group B to 'retreat') to intentionally cause chaos.",
      example: "A validator node telling one set of peers it voted 'YES' for block 1, while telling another set of peers it voted 'NO' for that same block.",
      icon: <Shield className="h-5 w-5 text-rose-500" />
    },
    {
      term: "Lagrange Polynomials",
      category: "Cryptography",
      definition: "A mathematical formula used to reconstruct a curve (polynomial) using only a subset of coordinate points.",
      analogy: "If you draw a straight line, you need exactly 2 points to know its path. If you have 3 points, you can draw a unique curve. If someone breaks the line coordinate into 10 points and gives them to 10 friends, any 3 friends can meet up, combine their points, and redraw the exact same curve.",
      example: "BLS signature aggregation: instead of carrying signatures of all 1,500 nodes, we reconstruct a single master signature curve using coordinate keys from any 60% of the nodes.",
      icon: <Lock className="h-5 w-5 text-indigo-500" />
    },
    {
      term: "Merkle Tree & Proofs",
      category: "Cryptography",
      definition: "A structure that hashes a list of items into a single master hash (root) to easily verify if an item exists in the list.",
      analogy: "Instead of carrying a giant 100-page receipt to prove you bought a pack of gum, the store prints a single barcode (Merkle Root) on your receipt. To prove your gum purchase later, you only show the cashier the gum (data item) and the store barcode's math trail (Merkle Proof), taking a microsecond to verify.",
      example: "A validator receives shred index #4 and verifies its math against the signed Slice Root. If the math matches, it is guaranteed the shred belongs to the leader's official block slice.",
      icon: <Network className="h-5 w-5 text-purple-500" />
    },
    {
      term: "Reed-Solomon Erasure Coding",
      category: "Network",
      definition: "A math technique that expands data into redundant pieces, allowing reconstruction from any subset.",
      analogy: "You shred a paper contract into 10 pieces, but write secret recovery formulas on each shred. As long as you recover any 6 shreds from the wind, you can recreate the entire document perfectly. If 4 shreds get lost, it doesn't matter.",
      example: "Alpenglow leader splits a block slice into 32 data shreds + 32 parity shreds (total 64). Even if 32 shreds get dropped due to network congestion, receiving nodes can rebuild the full block slice.",
      icon: <Cpu className="h-5 w-5 text-emerald-500" />
    },
    {
      term: "PS-P Partition Sampling",
      category: "Cryptography",
      definition: "Dividing stakes into deterministic bins to select relays, reducing variance and avoiding adversary takeover.",
      analogy: "If you want to pick 10 random representatives from a crowd where 20% are corrupt, drawing them randomly out of a bag (IID) could end up picking all 10 corrupt members by chance. If you first group the crowd into 10 neighborhoods (bins) and take exactly 1 from each, it's impossible to draw more than a few corrupt nodes.",
      example: "Solana epoch stakes are partitioned into 64 equal bins. Relays are drawn from each bin, preventing a 20% byzantine adversary from randomly dominating the 32 slots required to stall a block slice.",
      icon: <Compass className="h-5 w-5 text-blue-500" />
    },
    {
      term: "TVRF (Random Leader Selection)",
      category: "Consensus",
      definition: "A random number generator evaluated by nodes to decide who proposes blocks.",
      analogy: "A tamper-proof lottery machine that draws numbers in a way that anyone can mathematically verify the machine wasn't rigged, and nobody can predict who will win the next drawing until right before it happens.",
      example: "Prevents attackers from knowing the leader schedule far in advance, shielding the next slot leaders from targeted denial-of-service (DDoS) bandwidth flooding.",
      icon: <HelpCircle className="h-5 w-5 text-amber-500" />
    },
    {
      term: "GST (Global Stabilization Time)",
      category: "Time & Outage",
      definition: "An unknown theoretical milestone after which network message delays between honest nodes are bounded by Δ.",
      analogy: "Imagine a severe hurricane (network split) where mail delivery is delayed unpredictably. GST is the moment the storm passes. After GST, the postal service guarantees all letters between correct addresses arrive in 2 days (synchrony).",
      example: "Alpenglow uses partial synchrony: if a global fiber optic cable cuts, the chain remains safe (doesn't split) during asynchrony, and resumes voting once GST clears.",
      icon: <Clock className="h-5 w-5 text-yellow-500" />
    },
    {
      term: "Eager vs. Lazy Execution",
      category: "Consensus",
      definition: "Eager executes transactions before voting. Lazy votes on block hashes first and executes transactions in the background.",
      analogy: "Eager is like a restaurant where the chef cooks the meal, has you eat it, and only then writes it on the tab. Lazy is like a fast-food counter: they print your receipt (Vote) immediately, and make the food (Execute) in the background while taking other orders.",
      example: "Solana currently stalls blocks until transactions execute. Alpenglow votes on block hashes first (lazy), maximizing consensus throughput and delaying execution to concurrent background threads.",
      icon: <Cpu className="h-5 w-5 text-violet-500" />
    },
    {
      term: "Rotor vs. Turbine",
      category: "Network",
      definition: "Turbine uses a tree structure where nodes relay to children. Rotor uses a flat stake-weighted selection where relays send to all nodes.",
      analogy: "Turbine is like a pyramid telephone tree: if one node forgets to call, the entire branch is cut off. Rotor is like having a flat pool of runners: the leader hands different sections of a message to various runners, who then run out and broadcast their sections directly.",
      example: "Rotor eliminates deep relay hierarchies, capping block transmission delay at exactly 2 network hops (2δ) and distributing bandwidth load matching stakes.",
      icon: <Network className="h-5 w-5 text-teal-500" />
    },
    {
      term: "Standstill Megaphone",
      category: "Time & Outage",
      definition: "A recovery protocol triggered after 10 seconds of no finalized blocks, where nodes broadcast their highest states.",
      analogy: "If a power outage goes dark and everyone stops talking, a standstill happens. After a threshold timer, everyone grabs a megaphone and shouts their highest completed project. Instantly, everyone syncs up and continues working.",
      example: "Nodes detect 10s standstill (no finalization), broadcast their highest finalization certificate, and re-establish the consensus voting loop.",
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
  ];

  const filteredTerms = filter === 'All' ? terms : terms.filter(t => t.category === filter);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Glossary
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          The Jargon Buster
        </h1>
        <p className="text-lg text-muted-foreground">
          Every complex Solana and Alpenglow technical term explained with simple, real-world analogies.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-4">
        {(['All', 'Cryptography', 'Consensus', 'Network', 'Time & Outage'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
              filter === cat
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Glossaries Grid */}
      <div className="grid gap-6">
        {filteredTerms.map((t, idx) => (
          <Card key={idx} className="border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    {t.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">{t.term}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs tracking-wider uppercase font-semibold">
                  {t.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-sm leading-relaxed">
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Technical Definition</span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">{t.definition}</p>
              </div>
              <div className="p-3 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/40 rounded-lg">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-0.5">Real-World Analogy</span>
                <p className="text-slate-600 dark:text-slate-300 italic">"{t.analogy}"</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Alpenglow Example</span>
                <p className="text-muted-foreground text-sm">{t.example}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
