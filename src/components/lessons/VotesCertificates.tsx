import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, CheckCircle2, Play, HelpCircle, AlertCircle } from 'lucide-react';

export default function VotesCertificates() {
  const [activePath, setActivePath] = useState<'fast' | 'slow'>('fast');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 4: Votes & Certificates
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Votes, Certificates & Consensus Paths
        </h1>
        <p className="text-lg text-muted-foreground">
          How Alpenglow achieves consensus using lightweight votes and multi-signature certificates.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 animate-pulse" /> ELI5: Votes and Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3 font-sans">
          <p>
            When a validator receives a block, they don't just write a message saying "I got it." They cast a specific type of ballot:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>A Vote (The Ballot):</strong> An individual signature from one validator saying "I support Block X" or "I think we should skip this round."
            </li>
            <li>
              <strong>A Certificate (The Certified Result):</strong> An aggregate receipt proving that a quorum of validators voted. 
              Think of it like a petition: one signature is just a vote, but a signed petition with 80% of the town's signatures is a certified decision.
            </li>
          </ul>
          <p>
            If 80% vote yes, a <strong>Fast Certificate</strong> forms immediately. If only 60% vote yes, they must double-check in a second round, 
            forming a <strong>Slow Finalization Certificate</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Vote Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" /> Vote Types (Table 5)
          </CardTitle>
          <CardDescription className="text-sm">
            Validators issue these cryptographic signatures to indicate block or slot status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-bold">Vote Type</TableHead>
                  <TableHead className="text-xs font-bold">Signed Content</TableHead>
                  <TableHead className="text-xs font-bold">Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Notarization Vote</TableCell>
                  <TableCell className="font-mono text-[10px]">NotarVote(slot(b), hash(b))</TableCell>
                  <TableCell>First-round support: "I received this block and confirm it fits the chain sequence."</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Notar-Fallback Vote</TableCell>
                  <TableCell className="font-mono text-[10px]">NotarFallbackVote(slot(b), hash(b))</TableCell>
                  <TableCell>Second-round fallback: "I voted to skip, but enough peers voted to notarize, so I align."</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Skip Vote</TableCell>
                  <TableCell className="font-mono text-[10px]">SkipVote(slot)</TableCell>
                  <TableCell>First-round timeout: "I didn't receive the block in time; we should skip this slot."</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Skip-Fallback Vote</TableCell>
                  <TableCell className="font-mono text-[10px]">SkipFallbackVote(slot)</TableCell>
                  <TableCell>Second-round fallback: "I wanted to notarize, but there is no consensus. Let's skip."</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Finalization Vote</TableCell>
                  <TableCell className="font-mono text-[10px]">FinalVote(slot)</TableCell>
                  <TableCell>Finalization ticket: "I saw a 60% notarization certificate. I vote to seal this block."</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-500" /> Certificates & Thresholds (Table 6)
          </CardTitle>
          <CardDescription className="text-sm">
            Certificates aggregate individual votes using aggregate BLS multi-signatures to save bandwidth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-bold">Certificate Type</TableHead>
                  <TableHead className="text-xs font-bold">Aggregates</TableHead>
                  <TableHead className="text-xs font-bold">Required Stake</TableHead>
                  <TableHead className="text-xs font-bold">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                <TableRow className="bg-purple-50/20 dark:bg-purple-950/5">
                  <TableCell className="font-bold text-purple-700 dark:text-purple-400">Fast-Finalization Cert</TableCell>
                  <TableCell>NotarVotes</TableCell>
                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">≥ 80%</TableCell>
                  <TableCell>Finalizes the block immediately in 1 round.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Notarization Cert</TableCell>
                  <TableCell>NotarVotes</TableCell>
                  <TableCell>≥ 60%</TableCell>
                  <TableCell>Allows casting Finalization Votes (slow path step).</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Notar-Fallback Cert</TableCell>
                  <TableCell>NotarVotes OR NotarFallbackVotes</TableCell>
                  <TableCell>≥ 60%</TableCell>
                  <TableCell>Confirms a block is notarized even during network issues.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Skip Cert</TableCell>
                  <TableCell>SkipVotes OR SkipFallbackVotes</TableCell>
                  <TableCell>≥ 60%</TableCell>
                  <TableCell>Confirms the slot is officially skipped. Nodes build on previous parent.</TableCell>
                </TableRow>
                <TableRow className="bg-indigo-50/25 dark:bg-indigo-950/5">
                  <TableCell className="font-bold text-indigo-700 dark:text-indigo-400">Finalization Cert</TableCell>
                  <TableCell>FinalVotes</TableCell>
                  <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">≥ 60%</TableCell>
                  <TableCell>Finalizes the block in 2 rounds.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Two Path Visualizer Widget */}
      <Card className="border-purple-200 dark:border-purple-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-600" /> Interactive Finalization Flow
          </CardTitle>
          <CardDescription className="text-sm">
            Toggle between the Fast (1-round) and Slow (2-round) tracks to visualize vote aggregation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActivePath('fast')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold border ${
                activePath === 'fast'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Path 1: Fast Path (80% Notarization)
            </button>
            <button
              onClick={() => setActivePath('slow')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold border ${
                activePath === 'slow'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Path 2: Slow Path (60% Notarization & Finalization)
            </button>
          </div>

          {/* SVG Diagram representing path */}
          <div className="border rounded-lg p-5 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center min-h-[220px]">
            {activePath === 'fast' ? (
              <svg width="400" height="150" className="overflow-visible font-sans">
                <defs>
                  <linearGradient id="orange-grad-vc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="purple-grad-vc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="green-grad-vc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14f195" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                  <marker id="arrow-orange-vc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
                  </marker>
                  <marker id="arrow-purple-vc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9945ff" />
                  </marker>
                </defs>

                {/* Step 1 */}
                <rect x="10" y="45" width="95" height="50" rx="8" className="fill-orange-500/10 stroke-orange-500 stroke-[1.5]" />
                <text x="57.5" y="69" className="text-[10px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Leader Block</text>
                <text x="57.5" y="81" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Slot s</text>

                {/* Arrow */}
                <line x1="105" y1="70" x2="135" y2="70" stroke="#f97316" strokeWidth="1.5" markerEnd="url(#arrow-orange-vc)" />

                {/* Step 2 */}
                <rect x="140" y="45" width="115" height="50" rx="8" className="fill-purple-500/10 stroke-purple-500 stroke-[1.5]" />
                <text x="197.5" y="69" className="text-[10px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">≥ 80% NotarVotes</text>
                <text x="197.5" y="81" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Fast-Finalization Cert</text>

                {/* Arrow */}
                <line x1="255" y1="70" x2="285" y2="70" stroke="#9945ff" strokeWidth="1.5" markerEnd="url(#arrow-purple-vc)" />

                {/* Step 3 */}
                <rect x="290" y="45" width="100" height="50" rx="8" className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5] animate-pulse" />
                <text x="340" y="69" className="text-[10px] fill-emerald-600 dark:fill-emerald-400 font-bold" textAnchor="middle">⚡ FINALIZED</text>
                <text x="340" y="81" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Latency: 1 Round (δ)</text>
              </svg>
            ) : (
              <svg width="450" height="150" className="overflow-visible font-sans">
                <defs>
                  <linearGradient id="orange-grad-vcs" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="purple-grad-vcs" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="blue-grad-vcs" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.05" />
                  </linearGradient>
                  <marker id="arrow-orange-vcs" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
                  </marker>
                  <marker id="arrow-blue-vcs" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-purple-vcs" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9945ff" />
                  </marker>
                </defs>

                {/* Step 1 */}
                <rect x="5" y="45" width="85" height="50" rx="8" className="fill-orange-500/10 stroke-orange-500 stroke-[1.5]" />
                <text x="47.5" y="69" className="text-[10px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Leader Block</text>
                <text x="47.5" y="81" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Slot s</text>

                {/* Arrow */}
                <line x1="90" y1="70" x2="110" y2="70" stroke="#f97316" strokeWidth="1.5" markerEnd="url(#arrow-orange-vcs)" />

                {/* Step 2 */}
                <rect x="115" y="45" width="105" height="50" rx="8" className="fill-blue-500/10 stroke-blue-500 stroke-[1.5]" />
                <text x="167.5" y="66" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">≥ 60% NotarVotes</text>
                <text x="167.5" y="78" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Notarization Cert</text>

                {/* Arrow */}
                <line x1="220" y1="70" x2="240" y2="70" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow-blue-vcs)" />

                {/* Step 3 */}
                <rect x="245" y="45" width="105" height="50" rx="8" className="fill-purple-500/10 stroke-purple-500 stroke-[1.5]" />
                <text x="297.5" y="66" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">≥ 60% FinalVotes</text>
                <text x="297.5" y="78" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Finalization Cert</text>

                {/* Arrow */}
                <line x1="350" y1="70" x2="370" y2="70" stroke="#9945ff" strokeWidth="1.5" markerEnd="url(#arrow-purple-vcs)" />

                {/* Step 4 */}
                <rect x="375" y="45" width="70" height="50" rx="8" className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5] animate-pulse" />
                <text x="410" y="69" className="text-[10px] fill-emerald-600 dark:fill-emerald-400 font-bold" textAnchor="middle">FINALIZED</text>
                <text x="410" y="81" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">2 Rounds (2δ)</text>
              </svg>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fallback Events & Safety Mathematics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" /> Fallback Event Math: SafeToNotar & SafeToSkip
          </CardTitle>
          <CardDescription className="text-sm">
            Equations that prevent forks and state freezes during network latency spikes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            What happens if some nodes time out and vote to skip, while others vote to notarize? 
            To prevent the protocol from locking up, nodes maintain two safety events:
          </p>

          <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 space-y-3 font-mono text-sm">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1 font-sans">1. SafeToNotar Event Condition (Definition 16)</span>
              <code>notar(b) ≥ 40%  OR  (skip(s) + notar(b) ≥ 60% AND notar(b) ≥ 20%)</code>
              <p className="font-sans text-sm text-muted-foreground mt-1.5 leading-relaxed">
                <strong>Explanation:</strong> If a validator has already cast a skip vote, it is allowed to override 
                it and cast a <em>Notar-Fallback Vote</em> for block <code>b</code> if:
                <br />
                • The cumulative notarizations for <code>b</code> reach 40% (since we are close to 60%, let's support it).
                <br />
                • Or, the combination of skips and block notarizations is ≥ 60%, and <code>b</code> has at least 20% support.
                <br />
                <strong>Simple Word Problem:</strong> "Do I see 40% of the network already supporting this block? If yes, it's safe to hop onboard and help it pass!"
              </p>
            </div>
            
            <hr className="border-slate-200 dark:border-slate-800" />

            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1 font-sans">2. SafeToSkip Event Condition (Definition 16)</span>
              <code>skip(s) + Σ_b notar(b) - max_b notar(b) ≥ 40%</code>
              <p className="font-sans text-sm text-muted-foreground mt-1.5 leading-relaxed">
                <strong>Explanation:</strong> A node casts a <em>Skip-Fallback Vote</em> if the total voting weights on other blocks, 
                plus the existing skips, make it mathematically impossible for any single block to reach the 60% notarization threshold.
                <br />
                <strong>Simple Numerical Example:</strong> Suppose we have two competing blocks: Block X (25% support) and Block Y (25% support). 
                The sum of skips and secondary block votes is <code>25% (X) + 25% (Y) - 25% (max) = 25%</code>. If we have 15% skips, that is <code>15% + 25% = 40%</code>. Since 40% is locked elsewhere, neither X nor Y can ever reach <code>60%</code> (since only 60% is left, and they'd need all of it). So, we immediately trigger a skip vote to keep the network moving!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 6 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What determines if a block can be finalized on the Fast Path in just 1 network round?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) The block must contain no more than 10 transactions to ensure speed.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) The block must collect votes representing at least 80% of the active stake in the network.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) The block must be signed by the slot leader, bypassing all validator checkouts.
            </Button>
          </div>

          {quizAnswer !== null && (
            <div className={`p-4 border rounded-lg flex gap-3 items-start animate-fade-in ${
              quizAnswer === 1 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-800 dark:text-rose-300"
            }`}>
              {quizAnswer === 1 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Correct!</strong> If a block obtains a Fast Certificate (meaning $\ge$ 80% of the total network stake voted for it), it is finalized immediately in 1 single round. If it only gets between 60% and 80%, it falls back to the Slow Path (2 rounds).
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Incorrect, try again!</strong> Transaction count (A) does not dictate consensus paths, and a leader cannot finalize its own block unilaterally (C) without validator quorum approval.
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
