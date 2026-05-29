import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, ShieldAlert, Cpu, RefreshCw, Network, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Overview() {
  const [activeAnalogy, setActiveAnalogy] = useState<'broadcast' | 'rotor'>('broadcast');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 1: The Basics
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          What is Alpenglow Consensus?
        </h1>
        <p className="text-lg text-muted-foreground">
          A visual, analogy-driven guide to Solana's next-generation consensus engine.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5" /> ELI5: What is Consensus, anyway?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Imagine a group of 10 friends trying to choose a pizza topping. They can't meet in person, so they send text messages. 
            However, some friends have bad phone reception, and a few are pranksters who send "Pepperoni" to some friends and "Mushroom" to others. 
          </p>
          <p>
            <strong>Consensus</strong> is the set of rules they use to ensure that, despite the bad reception and the pranksters, 
            the group orders exactly <strong>one</strong> type of pizza, and everyone agrees on what it is. 
          </p>
          <p>
            In Solana, validators are the "friends" and the transactions (like token transfers) are the "pizza toppings." 
            <strong>Alpenglow</strong> is a brand new set of rules that makes this decision-making process incredibly fast (under half a second!) 
            and crash-proof.
          </p>
        </CardContent>
      </Card>

      {/* Real World Problem Banner */}
      <Card className="border-l-4 border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/5">
        <CardHeader>
          <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <ShieldAlert className="h-5 w-5" /> The Real-World Problem: The AWS Blackout
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Imagine a major cloud provider like Amazon Web Services (AWS) goes offline, causing 25% of all Solana validators to crash. 
            Under classic consensus protocols (like HotStuff or Tendermint), if more than 33% of validators are offline or malicious, 
            <strong>the blockchain halts completely</strong>. No transactions can be finalized.
          </p>
          <p>
            Alpenglow is built because in the real world, validators crash due to power outages, bugs, or network cuts. 
            By splitting consensus into a <strong>Fast Path (1-round)</strong> and a <strong>Slow Path (2-round)</strong>, Alpenglow continues to run smoothly 
            even if up to 40% of the network is crashed or offline!
          </p>
        </CardContent>
      </Card>

      {/* Interactive Visual Analogy: Broadcast vs Rotor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" /> Visual Comparison: The "Teacher & Homework" Analogy
          </CardTitle>
          <CardDescription>
            Why Alpenglow uses Rotor instead of traditional direct broadcasts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={activeAnalogy === 'broadcast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveAnalogy('broadcast')}
              className={`text-xs ${activeAnalogy === 'broadcast' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              Direct Broadcast (Bottleneck)
            </Button>
            <Button
              variant={activeAnalogy === 'rotor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveAnalogy('rotor')}
              className={`text-xs ${activeAnalogy === 'rotor' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              Rotor Relayed Dissemination (Balanced)
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-center">
            {/* SVG Visualizer */}
            <div className="border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center min-h-[220px]">
              {activeAnalogy === 'broadcast' ? (
                <svg width="220" height="180" className="overflow-visible font-sans">
                  <defs>
                    <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#be123c" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="slate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#475569" stopOpacity="0.05" />
                    </linearGradient>
                    <marker id="arrow-rose" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                    </marker>
                  </defs>
                  
                  {/* Lines */}
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const angle = (idx * 2 * Math.PI) / 6;
                    const x = 110 + 70 * Math.cos(angle);
                    const y = 90 + 70 * Math.sin(angle);
                    return (
                      <line 
                        key={`line-${idx}`} 
                        x1="110" 
                        y1="90" 
                        x2={x} 
                        y2={y} 
                        stroke="#f43f5e" 
                        strokeWidth="1.5" 
                        markerEnd="url(#arrow-rose)" 
                        className="opacity-70"
                      />
                    );
                  })}

                  {/* Leader Node */}
                  <circle cx="110" cy="90" r="18" className="fill-rose-500/10 stroke-rose-500 stroke-[1.5]" />
                  <text x="110" y="93" className="text-[9px] font-bold fill-rose-600 dark:fill-rose-400" textAnchor="middle">Leader</text>

                  {/* Validator Nodes */}
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const angle = (idx * 2 * Math.PI) / 6;
                    const x = 110 + 70 * Math.cos(angle);
                    const y = 90 + 70 * Math.sin(angle);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="11" className="fill-slate-500/10 dark:fill-slate-400/10 stroke-slate-400 dark:stroke-slate-600 stroke-[1.5]" />
                        <text x={x} y={y + 3} className="text-[8px] font-semibold fill-slate-700 dark:fill-slate-350" textAnchor="middle">V{idx + 1}</text>
                      </g>
                    );
                  })}
                  <text x="110" y="174" className="text-[10px] fill-rose-600 dark:fill-rose-400 font-bold" textAnchor="middle">Leader Bandwidth Saturation!</text>
                </svg>
              ) : (
                <svg width="220" height="180" className="overflow-visible font-sans">
                  <defs>
                    <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9945ff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14f195" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                    <marker id="arrow-purple" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9945ff" />
                    </marker>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="13" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#14f195" />
                    </marker>
                  </defs>

                  {/* Lines Leader -> Relays */}
                  <line x1="110" y1="30" x2="60" y2="90" stroke="#9945ff" strokeWidth="1.5" markerEnd="url(#arrow-purple)" className="opacity-80" />
                  <line x1="110" y1="30" x2="160" y2="90" stroke="#9945ff" strokeWidth="1.5" markerEnd="url(#arrow-purple)" className="opacity-80" />

                  {/* Leader */}
                  <circle cx="110" cy="30" r="15" className="fill-orange-500/10 stroke-orange-500 stroke-[1.5]" />
                  <text x="110" y="33" className="text-[9px] font-bold fill-orange-600 dark:fill-orange-400" textAnchor="middle">Leader</text>

                  {/* Relays */}
                  <circle cx="60" cy="90" r="14" className="fill-purple-500/10 stroke-purple-500 stroke-[1.5]" />
                  <text x="60" y="93" className="text-[8px] font-bold fill-purple-600 dark:fill-purple-400" textAnchor="middle">Relay A</text>

                  <circle cx="160" cy="90" r="14" className="fill-purple-500/10 stroke-purple-500 stroke-[1.5]" />
                  <text x="160" y="93" className="text-[8px] font-bold fill-purple-600 dark:fill-purple-400" textAnchor="middle">Relay B</text>

                  {/* Validators */}
                  {[0, 1, 2].map((idx) => {
                    const x = 40 + idx * 70;
                    const y = 150;
                    return (
                      <g key={idx}>
                        {/* Relay arrows to validators */}
                        <line x1="60" y1="90" x2={x} y2={y} stroke="#14f195" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrow-green)" className="opacity-70" />
                        <line x1="160" y1="90" x2={x} y2={y} stroke="#14f195" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrow-green)" className="opacity-70" />
                        <circle cx={x} cy={y} r="11" className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5]" />
                        <text x={x} y={y + 3} className="text-[8px] font-semibold fill-emerald-600 dark:fill-emerald-400" textAnchor="middle">V{idx + 1}</text>
                      </g>
                    );
                  })}
                  <text x="110" y="174" className="text-[10px] fill-emerald-600 dark:fill-emerald-400 font-bold" textAnchor="middle">Distributed network load!</text>
                </svg>
              )}
            </div>

            {/* Explanation text */}
            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                {activeAnalogy === 'broadcast' ? "Direct Broadcast Problem" : "Rotor Solution"}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {activeAnalogy === 'broadcast'
                  ? "In traditional direct broadcast, the leader must loop and send the block to all 1,500 nodes one-by-one. This overwhelms the leader's outgoing bandwidth (saturation), causing latency to scale linearly with the node count."
                  : "Under Rotor, the block is split. The leader only sends a tiny fraction of data to a few selected relays. Relays then forward their fragments to everyone. Bandwidth load is distributed evenly according to validators' stakes, avoiding bottlenecks."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Path Finalization Analogy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-500" /> Votor: Voice Vote vs. Secret Ballot
          </CardTitle>
          <CardDescription>Understanding the Fast Path vs. Slow Path liveness mechanism.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Why does Alpenglow have two finalization tracks running in parallel? It mimics a smart political convention:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-purple-600" /> Fast Path (Voice Vote)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the chairman proposes a law, and a massive 80% majority shouts "YES!", the law passes immediately 
                in one round. No recount needed. This occurs under healthy network conditions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-600" /> Slow Path (Secret Ballot)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the response is mixed (only 60% shout yes, and some are silent), a voice vote isn't secure enough. 
                The chairman orders a formal count: validators cast a second, verified vote (Finalization Vote) 
                to double-check consensus, concluding in 2 rounds.
              </p>
            </div>
          </div>
          <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-2 mt-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Simple Example for Dummies</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Suppose 10 friends are picking a movie. Total stake = 10 votes.
              <br />
              • <strong>Fast Path (1 Round):</strong> If 8 friends immediately yell "Action Movie!", the choice is finalized. Since only 2 friends remain, no other movie could possibly get a majority.
              <br />
              • <strong>Slow Path (2 Rounds):</strong> If only 6 friends yell "Action Movie!", that is a majority, but they must double-check to make sure no one changes their mind. They do a second round of paper voting. Once 6 paper ballots are turned in, the movie is finalized.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tower BFT vs Alpenglow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" /> Tower BFT vs. Alpenglow
          </CardTitle>
          <CardDescription>Why is Solana upgrading its consensus model?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Solana's current consensus protocol is <strong>Tower BFT</strong>, which is a variant of PBFT (Practical Byzantine Fault Tolerance). 
            While Tower BFT has enabled Solana to run at high speed, it has major limitations that Alpenglow is designed to solve:
          </p>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Solana Tower BFT (Existing)</h4>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Uses <strong>Lockouts</strong>: voting on a block locks a validator's stake for exponentially increasing periods (doubling with each vote).</li>
                <li>Validators must wait for execution to complete before voting, causing slots to be serialized.</li>
                <li>Bandwidth distribution relies on Turbine, which has high latency overhead on deep trees.</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50/20 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900 space-y-2 text-xs">
              <h4 className="font-bold text-purple-600 dark:text-purple-400 text-xs uppercase tracking-wider">Alpenglow Consensus (Upgrade)</h4>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Decoupled from lockouts. Voting and finalization are finalized in 1 or 2 linear network rounds.</li>
                <li>Supports <strong>Lazy (Asynchronous) Execution</strong>: validators can vote on block hashes before executing transactions, speeding up finalization.</li>
                <li>Uses <strong>Rotor</strong>: an optimal, flat relay structure where bandwidth matches stake weight, eliminating leader bottleneck.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 1 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What makes Alpenglow consensus uniquely suitable for a decentralized real-world network like Solana?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It makes all transaction fees completely free so users save money.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It splits consensus into Fast/Slow tracks, allowing finalization even if up to 40% of validators crash.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It automatically boots out any validators who aren't located in the same data center.
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
                  <div className="text-sm font-sans">
                    <strong>Correct!</strong> Splitting consensus into a Fast Path (1 round, needing 80% stake) and a Slow Path (2 rounds, needing 60% stake) allows the network to stay active even if up to 40% of the network goes offline or crashes, bypassing the classic 33.3% barrier.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> Alpenglow doesn't change fee models (A) or restrict node locations (C). It focuses on extreme crash resilience by introducing parallel Fast and Slow finalization paths.
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
