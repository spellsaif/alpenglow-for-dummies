import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Server, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExecutionModels() {
  const [pipelineMode, setPipelineMode] = useState<'eager' | 'lazy'>('eager');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 9: Execution Models
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Voting vs. Execution Models
        </h1>
        <p className="text-lg text-muted-foreground">
          How Alpenglow decouples transaction execution from block finalization to maximize speed.
        </p>
      </div>

      {/* The Cooking Analogy */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5" /> The "Order First, Cook Later" Analogy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Imagine a busy restaurant (Validator Network) serving meals (Blocks) to customers:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Eager Execution (Old Way):</strong> The chef receives an order, cooks the meal (Executes Transactions), 
              serves it, and only after the customer takes a bite and approves it (Votes), does the waiter write it on the check. 
              If the meal takes 5 minutes to cook, the waiter is blocked from taking new orders.
            </li>
            <li>
              <strong>Lazy Execution (Alpenglow Way):</strong> The waiter takes the order, immediately prints the receipt and adds it 
              to the official order queue (Votes), and hands it to the kitchen to cook in the background (Executes asynchronously). 
              The order is confirmed instantly, and the waiter can take the next order immediately.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Interactive Pipeline Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Cpu className="h-5 w-5 text-purple-600" /> Interactive Execution Pipeline Visualizer
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Compare how blocks propagate through eager vs. lazy pipelines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={pipelineMode === 'eager' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPipelineMode('eager')}
              className={`text-xs ${pipelineMode === 'eager' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              Eager (Execute &rarr; Vote)
            </Button>
            <Button
              variant={pipelineMode === 'lazy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPipelineMode('lazy')}
              className={`text-xs ${pipelineMode === 'lazy' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              Lazy (Vote &rarr; Execute)
            </Button>
          </div>

          {/* Timeline Grid */}
          <div className="border rounded-lg p-5 bg-slate-50 dark:bg-slate-900/50 space-y-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pipeline Flow</span>
            
            {pipelineMode === 'eager' ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white w-24 justify-center">BLOCK 1</Badge>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 p-1.5 rounded flex-1 text-center">Execute (Wait 200ms)</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 p-1.5 rounded flex-1 text-center">Vote & Finalize</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Badge className="bg-red-500 text-white w-24 justify-center">BLOCK 2</Badge>
                  <span className="bg-slate-200 text-slate-600 p-1.5 rounded flex-1 text-center">Blocked (Waiting for Block 1 finalization)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white w-24 justify-center">BLOCK 1</Badge>
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 p-1.5 rounded flex-1 text-center">Vote (Finalized Instantly)</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 p-1.5 rounded flex-1 text-center">Execute (In Background)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white w-24 justify-center">BLOCK 2</Badge>
                  <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 p-1.5 rounded flex-1 text-center">Vote (Finalized Instantly)</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 p-1.5 rounded flex-1 text-center">Execute (In Background)</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distributed Execution section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Server className="h-5 w-5 text-indigo-500" /> Distributed Execution: Pilotfish & Stingray
          </CardTitle>
          <CardDescription className="text-sm">
            Scaling computation beyond a single CPU bottleneck.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            When blockchains scale, processing thousands of smart contracts (transactions) requires massive computation. 
            Instead of forcing one single machine to handle both networking consensus and transaction execution, 
            modern validator architectures split these jobs:
          </p>
          <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-2 mt-2 text-sm">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-sans">Simple Analogy: The Grocery Store Checkout</span>
            <p className="text-muted-foreground leading-relaxed">
              • <strong>Single Machine Validator:</strong> A single cashier who scans items, bags them, collects cash, and keeps the line waiting while doing everything one-by-one. If a customer has a huge cart (large transaction block), the entire store line freezes.
              <br />
              • <strong>Distributed Validator (Pilotfish / Stingray):</strong> One coordinator (Consensus manager) who handles ID checks and payment approvals, while directing the items to 4 separate baggers (Worker machines) who package items in parallel. If traffic surges, they immediately call extra baggers to open new registers (Stingray's elastic scaling), keeping the checkout time consistent.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-1.5 font-sans">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase">Pilotfish [Kni+25]</h4>
              <p className="text-muted-foreground leading-relaxed">
                Decoupled execution model where a primary node handles consensus voting, and streams blocks to a cluster 
                of secondary workers. Workers execute segments of transactions in parallel and return the outputs.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-1.5 font-sans">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase">Stingray [SSK25]</h4>
              <p className="text-muted-foreground leading-relaxed">
                An elastic scaling engine where executors can be spun up dynamically on-demand during network traffic surges, 
                guaranteeing transaction execution times stay bounded under high-congestion events.
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 9 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What is the main benefit of Alpenglow's Lazy Execution over traditional Eager Execution?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It guarantees that transactions are processed in reverse order so fees are cheaper.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It allows validators to vote on block finality before completing the slow transaction execution, unblocking consensus speed.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It executes everything on the client browser instead of node servers.
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
                    <strong>Correct!</strong> In Lazy Execution, voting on the block hash is decoupled from execution. Consensus is finalized first (in 1 or 2 fast rounds), and transactions are executed asynchronously in the background.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> Transaction ordering (A) and executing on the browser client (C) are not related to Lazy Execution. Lazy Execution separates voting consensus from execution compute to maximize transaction throughput.
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
