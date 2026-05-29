import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, AlertOctagon, Volume2, Cpu, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CrashResilience() {
  const [activeTab, setActiveTab] = useState<'normal' | 'split'>('normal');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 10: Crash Resilience
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Crash Resilience & Recovery
        </h1>
        <p className="text-lg text-muted-foreground">
          How Alpenglow keeps processing slots during cloud blackouts and recovers from total standstill.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 animate-pulse" /> ELI5: The Storm Shelter
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Imagine a team of 10 people working on a project. 2 of them are secret pranksters (malicious nodes) trying to submit fake reports, and another 2 are currently out sick because of a storm (crashed nodes). 
          </p>
          <p>
            If you require 9 signatures to approve any project, your team freezes because the sick members are offline. But if you only require 5 signatures, the 2 pranksters could easily team up with 3 honest members and submit fake work! 
          </p>
          <p>
            Alpenglow solves this by using smart safety rules: nodes must double-check and prove they saw other honest members' votes before changing theirs. Even if 4 out of 10 nodes (40% total faults) are offline or malicious, the remaining correct members can safely finalize blocks without getting tricked or stuck!
          </p>
        </CardContent>
      </Card>

      {/* Intro to 20+20 under Assumptions 2 & 3 */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg">
            <Cpu className="h-5 w-5" /> The "20% Byzantine + 20% Crash" Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Under standard consensus, safety and liveness require &gt;80% of stake to be correct and active.
            However, in real-world environments, we often experience temporary infrastructure issues (like cloud provider outages) 
            that take blocks of validators offline (crashes).
          </p>
          <p>
            Alpenglow addresses this by maintaining safety and liveness with up to <strong>40% total faults</strong> (20% malicious + 20% offline) 
            by introducing <strong>Assumption 3 (Rotor Non-Equivocation)</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Assumption 3 and Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Network className="h-5 w-5 text-indigo-500" /> Equivocation Detection (Section 17.4)
          </CardTitle>
          <CardDescription className="text-sm">
            How validators catch a lying leader trying to split the network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>Assumption 3</strong> states that if one correct node receives block <code>b</code> via Rotor, 
            any other correct node that also reconstructs a block receives the <em>same</em> block <code>b</code>.
          </p>
          <p>
            If a malicious leader tries to violate this by sending different block data to different validators (equivocation):
          </p>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-2 text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">Detection Rule:</span>
            <p>
              If a correct node receives two shreds with different Merkle roots for the same slot <code>s</code> and slice index <code>t</code>:
              <br />
              1. The node marks the leader as malicious.
              <br />
              2. The node <strong>refuses to vote</strong> for any block in slot <code>s</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Network Split Explorer */}
      <Card className="border-purple-200 dark:border-purple-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <AlertOctagon className="h-5 w-5" /> The Split-Network Attack (Example 44)
          </CardTitle>
          <CardDescription className="text-sm">
            Visualize how a malicious leader attempts to stall the network when 20% of stake is crashed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('normal')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold border ${
                activeTab === 'normal'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Honest Leader (Consensus Succeeds)
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold border ${
                activeTab === 'split'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Malicious Leader (Split Attack Attempt)
            </button>
          </div>

          <div className="border rounded-lg p-5 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center min-h-[220px]">
            {activeTab === 'normal' ? (
              <svg width="400" height="160" className="overflow-visible font-sans">
                <defs>
                  <linearGradient id="orange-grad-cr" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="green-grad-cr" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14f195" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                  <marker id="arrow-green-cr" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Correct Leader */}
                <circle cx="200" cy="30" r="16" className="fill-orange-500/10 stroke-orange-500 stroke-[1.5]" />
                <text x="200" y="33" className="text-[9px] fill-orange-600 dark:fill-orange-400 font-bold" textAnchor="middle">Leader</text>

                {/* Group A */}
                <rect x="50" y="90" width="85" height="40" rx="8" className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5]" />
                <text x="92.5" y="108" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Group A (31%)</text>
                <text x="92.5" y="120" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Receives Block A</text>

                {/* Group B */}
                <rect x="265" y="90" width="85" height="40" rx="8" className="fill-emerald-500/10 stroke-emerald-500 stroke-[1.5]" />
                <text x="307.5" y="108" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Group B (31%)</text>
                <text x="307.5" y="120" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Receives Block A</text>

                {/* Arrows */}
                <line x1="184" y1="38" x2="110" y2="86" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-green-cr)" />
                <line x1="216" y1="38" x2="290" y2="86" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-green-cr)" />

                <text x="200" y="152" className="text-[10px] fill-emerald-600 dark:fill-emerald-400 font-bold" textAnchor="middle">Unified consensus: both groups vote for same Block A</text>
              </svg>
            ) : (
              <svg width="400" height="160" className="overflow-visible font-sans">
                <defs>
                  <linearGradient id="rose-grad-cr" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#be123c" stopOpacity="0.05" />
                  </linearGradient>
                  <marker id="arrow-rose-cr" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Malicious Leader */}
                <circle cx="200" cy="30" r="16" className="fill-rose-500/10 stroke-rose-500 stroke-[1.5] animate-pulse" />
                <text x="200" y="33" className="text-[9px] fill-rose-600 dark:fill-rose-450 font-bold" textAnchor="middle">Byz Leader</text>

                {/* Group A */}
                <rect x="50" y="90" width="85" height="40" rx="8" className="fill-rose-500/10 stroke-rose-500 stroke-[1.5]" />
                <text x="92.5" y="108" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Group A (31%)</text>
                <text x="92.5" y="120" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Receives Block X</text>

                {/* Group B */}
                <rect x="265" y="90" width="85" height="40" rx="8" className="fill-rose-500/10 stroke-rose-500 stroke-[1.5]" />
                <text x="307.5" y="108" className="text-[9px] fill-slate-800 dark:fill-slate-100 font-bold" textAnchor="middle">Group B (31%)</text>
                <text x="307.5" y="120" className="text-[8px] fill-slate-500 dark:fill-slate-400 font-mono" textAnchor="middle">Receives Block Y</text>

                {/* Arrows */}
                <line x1="184" y1="38" x2="110" y2="86" stroke="#f43f5e" strokeWidth="1.5" markerEnd="url(#arrow-rose-cr)" />
                <line x1="216" y1="38" x2="290" y2="86" stroke="#f43f5e" strokeWidth="1.5" markerEnd="url(#arrow-rose-cr)" />

                <text x="200" y="152" className="text-[10px] fill-rose-600 dark:fill-rose-400 font-bold" textAnchor="middle">Stall: Group A notarizes X, Group B notarizes Y (neither gets 60%)</text>
              </svg>
            )}
          </div>
          <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-2 mt-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Example 44 Arithmetic Walkthrough</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Suppose the network consists of:
              <br />
              • <strong>Group A (Correct):</strong> 31% stake
              <br />
              • <strong>Group B (Correct):</strong> 31% stake
              <br />
              • <strong>Crashed Nodes (Offline):</strong> 20% stake (correct but offline)
              <br />
              • <strong>Adversary (Malicious):</strong> 18% stake (which is &lt; 20% byzantine limit)
              <br />
              Total online voting stake = <code>31% + 31% + 18% = 80%</code>.
              <br />
              1. The malicious leader equivocates: sends Block X to Group A and Block Y to Group B.
              <br />
              2. Group A tries to notarize Block X. Maximum votes X can get: <code>31% (Group A) + 18% (Adversary) = 49%</code>.
              <br />
              3. Group B tries to notarize Block Y. Maximum votes Y can get: <code>31% (Group B) + 18% (Adversary) = 49%</code>.
              <br />
              4. <strong>The Stall:</strong> Since neither block can reach the <code>60%</code> threshold, no notarization certificate can form. The network freezes!
              <br />
              This is when the <strong>Standstill Megaphone Protocol</strong> kicks in (after 10s of no finalization) to flood the network with equivocation proofs and force the system to skip the slot.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Standstill Recovery Megaphone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Volume2 className="h-5 w-5 text-purple-600" /> Megaphone Standstill Recovery (Section 20.2)
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            How validators reset the network states after a complete freeze.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            If the network suffers a massive split where liveness is broken and no blocks are finalized for 
            <code>Δ_standstill = 10 seconds</code>, nodes execute a fallback recovery protocol:
          </p>

          <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 space-y-2 text-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs font-sans">The Recovery Megaphone Sequence:</h4>
            <ul className="list-decimal pl-5 space-y-1 text-muted-foreground leading-relaxed">
              <li>Each validator checks its local clock. If 10 seconds pass with no finalization, they enter recovery.</li>
              <li>Every validator broadcasts the highest <strong>Finalization Certificate</strong> they hold.</li>
              <li>They also broadcast all individual votes and intermediate certificates they have observed for newer slots.</li>
              <li>These messages are re-flooded across the network, immediately syncing late nodes and allowing voting loops to resume.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 10 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What happens if a correct node receives two different shreds with different Merkle roots for the same slot and slice index (equivocation)?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It immediately crash-halts its own server.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It automatically votes for both blocks to see which one wins.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It identifies the leader as malicious, refuses to vote for any block in that slot, and shares the proof of equivocation with the network.
            </Button>
          </div>

          {quizAnswer !== null && (
            <div className={`p-4 border rounded-lg flex gap-3 items-start animate-fade-in ${
              quizAnswer === 2 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-800 dark:text-rose-300"
            }`}>
              {quizAnswer === 2 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Correct!</strong> A correct validator will detect equivocation by comparing slice roots for the same slot. Once detected, it halts voting in that slot to prevent forks, and spreads the proof to allow other nodes to slash the leader.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> Halting the server (A) is too extreme and hurts availability. Voting for both (B) is double-voting, which is a slashable safety offense. Correct nodes refuse to vote and sound the alarm (C).
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
