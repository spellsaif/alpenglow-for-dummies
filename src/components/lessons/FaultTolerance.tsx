import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShieldCheck, ShieldAlert, Zap, AlertOctagon, HelpCircle, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

export default function FaultTolerance() {
  const [byzantine, setByzantine] = useState(15);
  const [crashed, setCrashed] = useState(15);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const correct = Math.max(0, 100 - byzantine - crashed);

  // Classic BFT Bounds (e.g. PBFT, Tendermint, HotStuff)
  // Needs f < 33.3% total faults (Byzantine + Crashes)
  const classicTotalFaults = byzantine + crashed;
  const classicSafe = byzantine < 33.3;
  const classicLive = classicTotalFaults < 33.3;

  // Alpenglow Bounds
  // Safety: Byzantine < 20% (Always safe regardless of crashes, because crashes act like high latency)
  const alpenglowSafe = byzantine < 20;
  
  // Liveness:
  // - Fast Path: Correct >= 80% (needs Byzantine + Crashed <= 20%)
  // - Slow Path: Correct >= 60% (needs Byzantine + Crashed <= 40%) - requires Assumption 3
  const alpenglowLiveFast = correct >= 80;
  const alpenglowLiveSlow = correct >= 60 && byzantine < 20; 
  const alpenglowStall = correct < 60 || byzantine >= 20;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 5: Fault Tolerance
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Fault Tolerance: The "20+20" Design
        </h1>
        <p className="text-lg text-muted-foreground">
          Why Alpenglow sacrifices a bit of Byzantine tolerance to dramatically increase crash resilience.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 animate-pulse" /> ELI5: What is the "20+20" trade-off?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3 font-sans">
          <p>
            Imagine building a house in a city that faces two threats: **thieves (malicious actors)** and **storms (servers crashing)**.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>
              <strong>The Old Way (Classic 33%):</strong> Your security system protects you if up to 33.3% of people are thieves. 
              But there is a catch: if a storm cuts power (nodes crash) and 33.3% of your house sensors go offline, your alarm system freezes and lockouts stop working.
            </li>
            <li>
              <strong>The Alpenglow Way (20+20):</strong> We make a compromise. We lower our thief protection slightly to 20%. 
              In exchange, we gain huge storm protection: the house remains fully functional even if up to 20% of validators crash *on top of* the 20% thieves. 
              That means up to <strong>40% of the network can be compromised/offline</strong> and the chain still progresses!
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Intro Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classic 33% vs. Alpenglow 20+20</CardTitle>
          <CardDescription>A comparative overview of Byzantine and Crash limits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-muted-foreground uppercase border-b">
                  <th className="p-3">Model</th>
                  <th className="p-3">Byzantine (Malicious) Tolerance</th>
                  <th className="p-3">Total Fault Tolerance (Crash + Byzantine)</th>
                  <th className="p-3">Real-world Philosophy</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600 dark:text-slate-300 text-xs">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Classic BFT (3f+1)</td>
                  <td className="p-3 text-red-600 dark:text-red-400">&lt; 33.3%</td>
                  <td className="p-3 text-red-600 dark:text-red-400">&lt; 33.3%</td>
                  <td className="p-3">Tolerates a high fraction of malicious nodes, but crashes count identically.</td>
                </tr>
                <tr className="bg-purple-50/25 dark:bg-purple-950/5">
                  <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">Alpenglow (5f+1)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400">&lt; 20%</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400">Up to 40% (20% Byzantine + 20% Crash)</td>
                  <td className="p-3">Aims for realistic limits by prioritizing crash recovery under cloud outages while punishing malicious behavior.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quorum Math Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" /> Quorum Intersection Math
          </CardTitle>
          <CardDescription>Why is Alpenglow safe? The mathematics of overlaps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            In Alpenglow, the <strong>Fast Path</strong> requires 80% of the total network stake to vote yes. 
            Why does this prevent forks? Let's do the arithmetic:
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 border rounded font-mono space-y-2">
            <div>
              Suppose two conflicting blocks <code>A</code> and <code>B</code> are both fast-finalized at the same slot.
            </div>
            <div>
              Stake supporting block <code>A</code>: <code>&ge; 80%</code>
            </div>
            <div>
              Stake supporting block <code>B</code>: <code>&ge; 80%</code>
            </div>
            <div>
              Sum of voting stakes: <code>&ge; 160%</code>
            </div>
            <div>
              Overlap: <code>&ge; 60%</code> (since total stake is capped at 100%)
            </div>
          </div>
          <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-3">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Visual Grid Representation (10 Nodes = 100% Stake)</span>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(node => (
                <div 
                  key={node} 
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-bold font-mono text-center flex flex-col items-center justify-center ${
                    node <= 2 
                      ? 'bg-rose-500/10 text-rose-600 border-rose-300' // Block A only
                      : node >= 9
                      ? 'bg-blue-500/10 text-blue-600 border-blue-300' // Block B only
                      : 'bg-purple-500/15 text-purple-600 border-purple-400 font-extrabold ring-1 ring-purple-600/20' // Overlap
                  }`}
                >
                  <span>N{node}</span>
                  <span className="text-[9px] font-normal text-muted-foreground">{node <= 2 ? 'A' : node >= 9 ? 'B' : 'A + B'}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              • <strong>Block A supporters:</strong> Nodes 1 to 8 (80% stake)
              <br />
              • <strong>Block B supporters:</strong> Nodes 3 to 10 (80% stake)
              <br />
              • <strong>Overlap:</strong> Nodes 3 to 8 (60% stake, highlighted in purple) voted for BOTH blocks.
              <br />
              Since malicious (Byzantine) stake is &lt; 20% (at most 2 nodes, e.g., Nodes 3 and 4), at least 4 of these overlap nodes (Nodes 5, 6, 7, 8) must be correct and honest. 
              But honest nodes can vote at most once per slot! This contradiction guarantees a fork can never occur.
            </p>
          </div>
          <p>
            This 60% overlap represents nodes that voted for <strong>both</strong> block A and block B. 
            By Byzantine assumptions, the adversary controls <code>&lt; 20%</code> of stake. 
            Thus, at least <code>40%</code> of the overlap must consist of <strong>correct (honest) nodes</strong>.
          </p>
          <p>
            However, correct nodes are mathematically coded to vote <strong>exactly once</strong> per slot (Lemma 20). 
            Therefore, it is impossible for correct nodes to vote twice, creating a contradiction. 
            Thus, two conflicting blocks can never both be fast-finalized!
          </p>
        </CardContent>
      </Card>

      {/* Interactive Calculator */}
      <Card className="shadow-lg border-purple-100 dark:border-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Zap className="h-5 w-5" /> Interactive Stake Fault Calculator
          </CardTitle>
          <CardDescription>
            Simulate a network split. Adjust the slider weights to see when consensus breaks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Sliders */}
          <div className="grid gap-6 md:grid-cols-2 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-rose-500">
                <span>Byzantine Stake: {byzantine}%</span>
                <span>(Malicious actors)</span>
              </div>
              <Slider
                value={[byzantine]}
                onValueChange={(val: number[]) => {
                  setByzantine(val[0]);
                  if (val[0] + crashed > 100) {
                    setCrashed(100 - val[0]);
                  }
                }}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-amber-500">
                <span>Crashed Stake: {crashed}%</span>
                <span>(Offline/Network issues)</span>
              </div>
              <Slider
                value={[crashed]}
                onValueChange={(val: number[]) => {
                  setCrashed(val[0]);
                  if (val[0] + byzantine > 100) {
                    setByzantine(100 - val[0]);
                  }
                }}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Stake Weight Allocation</span>
            <div className="w-full h-8 rounded-lg overflow-hidden flex shadow-inner font-bold text-xs text-white">
              {correct > 0 && (
                <div 
                  className="bg-emerald-500 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${correct}%` }}
                >
                  {correct >= 10 && `Correct: ${correct}%`}
                </div>
              )}
              {byzantine > 0 && (
                <div 
                  className="bg-rose-500 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${byzantine}%` }}
                >
                  {byzantine >= 10 && `Byzantine: ${byzantine}%`}
                </div>
              )}
              {crashed > 0 && (
                <div 
                  className="bg-amber-500 flex items-center justify-center transition-all duration-300"
                  style={{ width: `${crashed}%` }}
                >
                  {crashed >= 10 && `Crashed: ${crashed}%`}
                </div>
              )}
            </div>
          </div>

          {/* Results Side-by-Side */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Classic Results */}
            <Card className="border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Classic BFT Predictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900 border">
                  <span>Safety Status</span>
                  {classicSafe ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex gap-1 items-center animate-fade-in text-xs">
                      <ShieldCheck className="h-3 w-3" /> SECURE
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex gap-1 items-center animate-fade-in text-xs">
                      <ShieldAlert className="h-3 w-3" /> FORK RISK
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900 border">
                  <span>Liveness Status</span>
                  {classicLive ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex gap-1 items-center animate-fade-in text-xs">
                      <Zap className="h-3 w-3" /> PROGRESSING
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex gap-1 items-center animate-fade-in text-xs">
                      <AlertOctagon className="h-3 w-3" /> STALLED
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Classic BFT breaks whenever total faults (malicious + offline) reach 33.3%. In your current scenario, 
                  total faults are <strong>{classicTotalFaults}%</strong>.
                </p>
              </CardContent>
            </Card>

            {/* Alpenglow Results */}
            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-purple-600 dark:text-purple-400">
                  Alpenglow (20+20) Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-2 rounded bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-950">
                  <span>Safety Status</span>
                  {alpenglowSafe ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex gap-1 items-center animate-fade-in text-xs">
                      <ShieldCheck className="h-3 w-3" /> SECURE
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex gap-1 items-center animate-fade-in text-xs">
                      <ShieldAlert className="h-3 w-3" /> FORK RISK
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-950">
                  <span>Liveness Status</span>
                  {alpenglowLiveFast ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex gap-1 items-center animate-fade-in text-xs">
                      <Zap className="h-3 w-3" /> FAST PATH (1 Round)
                    </Badge>
                  ) : alpenglowLiveSlow ? (
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white flex gap-1 items-center animate-fade-in text-xs">
                      <Zap className="h-3 w-3" /> SLOW PATH (2 Rounds)
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex gap-1 items-center animate-fade-in text-xs">
                      <AlertOctagon className="h-3 w-3" /> STALLED
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Alpenglow is <strong>always safe</strong> under partial synchrony as long as Byzantine stake is &lt; 20%. 
                  {alpenglowLiveFast && " With >= 80% correct active stake, it processes slots in a single voting round!"}
                  {alpenglowLiveSlow && " With >= 60% correct active stake, it completes liveness in 2 rounds using Fallback Certificates (requires Assumption 3)."}
                  {alpenglowStall && " Stalled: Active correct stake is less than 60%, or Byzantine stake is >= 20%."}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Assumptions Description */}
      <Card>
        <CardHeader>
          <CardTitle>The Three Critical Assumptions</CardTitle>
          <CardDescription>Understanding the security properties that back the 20+20 design.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="p-4 rounded bg-slate-50 dark:bg-slate-900 border space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 font-sans">Assumption 1 (Standard Safety & Liveness)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Byzantine (malicious) nodes control <strong>&lt; 20%</strong> of the total stake. The remaining <strong>&gt; 80%</strong> are correct. 
              This is the classic case where 1-round fast finalization handles all slot progress.
            </p>
          </div>

          <div className="p-4 rounded bg-slate-50 dark:bg-slate-900 border space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 font-sans">Assumption 2 (Extended Crash Resilience)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Byzantine nodes control <strong>&lt; 20%</strong> of stake. An additional <strong>&le; 20%</strong> of stake is crashed 
              (offline, not voting). The remaining <strong>&gt; 60%</strong> are online and correct. Liveness still holds!
            </p>
          </div>

          <div className="p-4 rounded bg-slate-50 dark:bg-slate-900 border space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 font-sans">Assumption 3 (Rotor Non-Equivocation)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If any correct node receives a full block <code>b</code> via Rotor for slot <code>s</code>, any other correct node 
              that also receives a full block via Rotor for slot <code>s</code> receives the <strong>same block <code>b</code></strong>. 
              This holds automatically if the leader is correct, and can only be violated if a malicious leader tries to send 
              different block data to different parts of the network.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 7 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            In Alpenglow's "20+20" design, what is the maximum percentage of validators that can go offline (crash) on top of the 20% malicious threshold without stalling the network?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) Only 10% (any more will halt block finalization).
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) Up to 20% crashed/offline nodes (allowing a total of 40% combined network faults).
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) Exactly 33.3%, just like in classic consensus.
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
                    <strong>Correct!</strong> Alpenglow's extended liveness guarantees (Assumption 2) allow up to 20% of the network to crash or go offline *on top of* the 20% malicious Byzantine limit, keeping the chain running as long as 60% of correct nodes stay online.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Incorrect, try again!</strong> Alpenglow improves upon both 10% limits (A) and the classic 33.3% threshold (C) by trading off a bit of malicious resilience to survive up to 40% total network disruption.
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
