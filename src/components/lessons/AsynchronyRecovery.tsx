import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, ShieldAlert, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AsynchronyRecovery() {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 13: Asynchrony & Recovery
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Asynchrony, Rejoining, and Standstill Recovery
        </h1>
        <p className="text-lg text-muted-foreground">
          How Alpenglow recovers from network outages and helps offline nodes catch up.
        </p>
      </div>

      {/* Traveler Analogy */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5" /> The "Lost Traveler Rejoining the Caravan" Analogy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            If a validator crashes or goes offline for hours, it falls behind. 
            How does it catch up without parsing millions of old voting messages?
          </p>
          <p>
            Imagine a traveler who fell asleep and got lost behind a traveling desert caravan:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Classic Catch-up:</strong> The traveler walks all the way back to the starting city and re-tracks 
              every single footprint. This is slow and exhausting.
            </li>
            <li>
              <strong>Alpenglow Rejoining (Section 20.1):</strong> The traveler sends a message ahead to find the caravan's 
              current position (<strong>Finalization Certificate</strong>). The traveler hitches a ride directly to that spot 
              (<strong>Repair Block</strong>), walks back a few steps to verify the path (Parent links), and instantly rejoins 
              the caravan at the front!
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Standstill Recovery Analogy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Standstill Recovery: The "Megaphone" Protocol
          </CardTitle>
          <CardDescription className="text-sm">What happens when the entire blockchain freezes?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            If the internet experiences a massive global outage, consensus halts. No new slots are finalized. 
            Once the outage ends, how do nodes wake up and resume consensus?
          </p>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-2 text-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase text-xs">
              The Megaphone Recovery (Section 20.2)
            </h4>
            <p className="leading-relaxed">
              If no blocks are finalized for <strong>10 seconds</strong> (Standstill Trigger <code>&Delta;_standstill</code>), 
              every node pulls out a megaphone. They broadcast:
              <br />
              1. The highest finalized slot certificate they know.
              <br />
              2. Every vote and certificate they observed before the freeze.
              <br />
              This floods the network with missing messages, immediately aligning all validators to the same state 
              and kicking liveness back into action.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Timeouts Math Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Activity className="h-5 w-5 text-purple-600" /> Dynamic Timeouts: Exponential Growth Math
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            How nodes adjust to extreme network delays without central coordination.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Static timeouts fail during deep network cuts. If timeouts are set to 1.2s, but the network delay 
            spikes to 5s, the nodes will keep timing out and skipping slots forever.
          </p>
          <p>
            Alpenglow resolves this by growing timeouts <strong>exponentially</strong> during prolonged standstill (after 10s):
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 border rounded text-center font-mono space-y-2">
            <div className="text-slate-800 dark:text-slate-200">
              <code>Timeout = BaseTimeout &times; (1 + &epsilon;)<sup>WindowsMissed</sup></code>
            </div>
            <div className="text-xs text-muted-foreground font-sans">
              where <code>&epsilon; = 5%</code> (Timeout increase rate per window).
            </div>
          </div>
          <p>
            Because this growth is exponential, the timeout rapidly scales to outlast any network delay (e.g. scaling to 
            10s, 30s, or minutes). 
            As soon as a block is finalized, the timeouts <strong>instantly snap back</strong> to the base 1.2s.
          </p>
          <div className="p-3 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-2 mt-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-sans">Numerical Timeout Growth Example (Base = 1.2s, ε = 5%)</span>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border font-mono">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b text-xs uppercase tracking-wider">
                    <th className="p-1.5 font-bold">Windows Missed</th>
                    <th className="p-1.5 font-bold">Timeout Calculation</th>
                    <th className="p-1.5 font-bold">Resulting Timeout</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-1.5">0 (Base)</td>
                    <td className="p-1.5">1.2s &times; 1.05⁰</td>
                    <td className="p-1.5 font-semibold text-slate-800 dark:text-slate-200">1.20 seconds</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">1</td>
                    <td className="p-1.5">1.2s &times; 1.05¹</td>
                    <td className="p-1.5">1.26 seconds</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">5</td>
                    <td className="p-1.5">1.2s &times; 1.05⁵</td>
                    <td className="p-1.5">1.53 seconds</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">20</td>
                    <td className="p-1.5">1.2s &times; 1.05²⁰</td>
                    <td className="p-1.5">3.18 seconds</td>
                  </tr>
                  <tr>
                    <td className="p-1.5">50</td>
                    <td className="p-1.5">1.2s &times; 1.05⁵⁰</td>
                    <td className="p-1.5 font-bold text-rose-500">13.76 seconds</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Notice how the timeout exponentially grows to exceed massive network delays (13.76 seconds by window 50). This guarantees that liveness will eventually recover, no matter how severe the delay, and snaps back immediately to 1.2s once a block is finalized!
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 13 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            How does a validator node recover when the network halts completely for more than 10 seconds (Standstill event)?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It deletes its local database and starts rebuilding the entire blockchain from slot 0.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It triggers the Megaphone Protocol, broadcasting its highest Finalization Certificate and newer votes to re-sync the network's state.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It shuts down and waits for a manual reboot from a central server administrator.
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
                    <strong>Correct!</strong> The Standstill Megaphone triggers after 10s of no finalization, causing nodes to broadcast their highest finalized state and observed certificates. This floods the network with recovery info to sync correct nodes and unfreeze the network.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> Rebuilding from slot 0 (A) would take days and is unnecessary. Shutting down to wait for an administrator (C) contradicts the decentralized recovery logic of the protocol.
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
