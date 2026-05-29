import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Compass, HelpCircle, HardDrive, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BlockCreation() {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 8: Leader Logic & Repair
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Block Creation and Repair Protocol
        </h1>
        <p className="text-lg text-muted-foreground">
          How leaders optimistically build block chains and validators repair missing shreds.
        </p>
      </div>

      {/* Analogy Box */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5" /> The Leader's "Parallel Printing Press" Analogy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Imagine you are a reporter tasked with writing a 4-chapter report (<strong>Leader Window</strong> of 4 slots). 
            Normally, you might wait for the editor-in-chief to sign off on the previous reporter's final report (<strong>Parent Certificate</strong>) 
            before you write a single word. But this wastes critical minutes.
          </p>
          <p>
            Instead, you use <strong>Optimistic Block Building:</strong>
          </p>
          <p>
            You start drafting Chapter 1 immediately, assuming the draft you saw from the previous reporter will be approved. 
            You print and distribute paragraphs (<strong>Slices</strong>) of Chapter 1 in real-time. If the editor-in-chief suddenly 
            announces that a <em>different</em> draft was approved, you don't panic! You just rewrite the remaining sections of Chapter 1, 
            pointing them to the new approved parent. The early paragraphs you sent are simply marked "ignore" for final records.
          </p>
          <p>
            Once Chapter 1 is done, you write Chapters 2, 3, and 4 in rapid succession. The next reporter starts writing their Chapter 1 
            the second they get your final paragraph—no waiting for certificates!
          </p>
        </CardContent>
      </Card>

      {/* Leader Algorithm breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Algorithm 3 Walkthrough: Optimistic Leader Logic</CardTitle>
          <CardDescription className="text-sm">How the leader builds slices in real-time before approval is completed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-950 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto space-y-1.5 border leading-relaxed">
            <div><span className="text-slate-500">// 1. Wait until previous block is seen OR parent chain is ready</span></div>
            <div>wait until block <span className="text-purple-400">b_p</span> in slot <span className="text-purple-400">s-1</span> received OR ParentReady(hash(<span className="text-purple-400">b_p</span>))</div>
            <br />
            <div><span className="text-slate-500">// 2. Optimistic phase: start streaming slices before parent notarization is finalized</span></div>
            <div>b &larr; generate block with parent <span className="text-purple-400">b_p</span> in slot <span className="text-purple-400">s</span></div>
            <div>t &larr; 1 <span className="text-slate-500">// slice index</span></div>
            <div>while ParentReady(.) &notin; state[s]:</div>
            <div className="pl-4">Rotor(slice t of b) <span className="text-slate-500">// stream slice t immediately</span></div>
            <div className="pl-4">t &larr; t + 1</div>
            <br />
            <div><span className="text-slate-500">// 3. Double-Check parent: did the network select a different parent?</span></div>
            <div>if ParentReady(hash(<span className="text-purple-400">b_p</span>)) &notin; state[s]:</div>
            <div className="pl-4"><span className="text-slate-500">// Parent switched! Re-anchor block to the correct finalized parent</span></div>
            <div className="pl-4">b_p &larr; any b' such that ParentReady(hash(b')) &in; state[s]</div>
            <div className="pl-4">b &larr; generate block with parent <span className="text-purple-400">b_p</span> in slot <span className="text-purple-400">s</span>, starting at slice index t</div>
            <div className="pl-4"><span className="text-slate-500">// Slices 1..t-1 are now flagged as ignored for execution</span></div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This algorithm allows Alpenglow to achieve <strong>zero-gap streaming</strong>. Leaders do not waste network cycles waiting for 
            notarization certificates to form. Slices are piped as soon as transactions arrive, keeping the network pipeline full.
          </p>
        </CardContent>
      </Card>

      {/* Repair Protocol section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <RefreshCw className="h-5 w-5 text-emerald-500" /> The Repair Protocol (Algorithm 4)
          </CardTitle>
          <CardDescription className="text-sm">
            How nodes fetch missing block data from correct peers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-slate-600 dark:text-slate-300">
            If a node misses a block due to network packet losses, but observes a Notarization Certificate, 
            it triggers the <strong>Repair Protocol</strong>.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-semibold">
                <HardDrive className="h-4 w-4" /> Stake-Weighted Sampling
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  To fetch data, a node must query a peer. Which peer? 
                  Instead of querying a static coordinator or picking at random, the node executes <code>sampleNode()</code>.
                </p>
                <p>
                  This samples a node from the network with probability proportional to its stake. 
                  Because correct nodes control &gt; 80% (or &gt; 60%) of stake, this maximizes the chance of querying 
                  an honest node, while minimizing exposure to Byzantine DOS/denial attacks.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="flex items-center gap-2 text-sm font-semibold">
                <HelpCircle className="h-4 w-4" /> The Query API Sequence
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Lagging nodes fetch blocks concurrently by asking the sampled node:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded font-mono text-xs space-y-2 border">
                  <div>
                    <span className="font-bold text-indigo-500">getSliceCount(hash, peer):</span> 
                    Returns total slice count <code>k</code> in the block, with a Merkle path proving <code>r_k</code> is the last leaf.
                  </div>
                  <div>
                    <span className="font-bold text-indigo-500">getSliceHash(t, hash, peer):</span> 
                    Returns the root hash <code>r_t</code> for slice <code>t</code>.
                  </div>
                  <div>
                    <span className="font-bold text-indigo-500">getShred(s, t, i, r_t, peer):</span> 
                    Returns shred <code>i</code> containing the data fragment <code>d_i</code>.
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 8 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            How does a correct leader achieve zero-gap block streaming if the previous block hasn't been finalized yet?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) The leader pauses all transactions and waits until the network sends the Notarization Certificate.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) The leader executes optimistic block building, streaming slices of the new block assuming the last block they saw will be finalized. If the parent changes, they adjust the remaining slices.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) The leader queries the central Solana server to ask which block they should use as parent.
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
                    <strong>Correct!</strong> Through optimistic building, leaders stream slices referencing their best candidate for a parent block. If the parent is later switched, they just re-anchor subsequent slices, making sure no time is wasted waiting for certificates.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> The leader cannot afford to wait (A) as that breaks the zero-gap pipeline. Also, Solana is decentralized; there is no central server to query (C).
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
