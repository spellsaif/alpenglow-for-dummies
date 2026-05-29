import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Lock, ShieldCheck, Zap, Layers, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProofsLesson() {
  const [proofStep, setProofStep] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const steps = [
    {
      title: "Step 1: One Vote Per Slot (Lemma 20)",
      description: "A correct node is mathematically coded to cast EXACTLY ONE notarization vote OR skip vote per slot. Once it votes, the state is locked. This is the bedrock of all safety proofs.",
      icon: <Lock className="h-5 w-5 text-indigo-500" />
    },
    {
      title: "Step 2: 40% Notarization Lock (Lemma 23)",
      description: "If correct nodes representing >40% of stake notarize block A, no other block B in that slot can ever be notarized. Why? Notarization requires 60% stake. To get 60% for B, some correct nodes would have to vote twice (since adversary controls <20%), which violates Step 1.",
      icon: <Lock className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Step 3: At Most One Notarized Block (Lemma 24)",
      description: "Because correct nodes representing >40% stake lock the vote (Step 2), it is mathematically impossible for two conflicting blocks in the same slot to both get a 60% notarization certificate. There can be at most ONE notarized block per slot.",
      icon: <Lock className="h-5 w-5 text-purple-500" />
    },
    {
      title: "Step 4: Ancestor Propagation (Lemma 28)",
      description: "When a validator votes to notarize a block within a leader window, it is required to have voted for the parent block in the previous slot. Therefore, notarizing a block automatically locks in all its ancestors within that window.",
      icon: <Lock className="h-5 w-5 text-pink-500" />
    },
    {
      title: "Step 5: Theorem 1 — Safety Guarantee",
      description: "If any correct node finalizes block A in slot s, and another correct node finalizes block B in slot s' ≥ s, B MUST be a descendant of A. Conflicting finalizations are impossible. Your funds are 100% secure!",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 12: Safety & Liveness Proofs
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Safety & Liveness Proofs
        </h1>
        <p className="text-lg text-muted-foreground">
          A visual, step-by-step walkthrough of the mathematical proofs behind Alpenglow's consensus.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 animate-pulse" /> ELI5: The Security Locks
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            How do we prove mathematically that a blockchain will never finalize two conflicting blocks at the same time?
          </p>
          <p>
            Imagine a high-security lockbox that needs 6 keys out of 10 to open. If you want to lock document A inside, you must collect at least 6 keys. Since there are only 10 keys in total, it is impossible for someone else to collect 6 keys for document B without borrowing at least 2 keys from people who already locked document A!
          </p>
          <p>
            Since correct keyholders are programmed to never give their keys to two different documents for the same slot, no one can ever open a lockbox for a conflicting document. The math is simple, ironclad, and guarantees your ledger is 100% safe.
          </p>
        </CardContent>
      </Card>

      {/* Interactive Safety Lock Chain */}
      <Card className="border-purple-200 dark:border-purple-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Layers className="h-5 w-5" /> Interactive Security Chain Explorer
          </CardTitle>
          <CardDescription className="text-sm">
            Step through the mathematical logic of Theorem 1 (Safety) to see how locks build upon each other.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step Indicators */}
          <div className="flex justify-between items-center relative">
            <div className="absolute h-0.5 bg-slate-200 dark:bg-slate-800 left-4 right-4 top-1/2 -translate-y-1/2 z-0"></div>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setProofStep(idx)}
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                  proofStep === idx
                    ? 'bg-purple-600 text-white border-purple-600 scale-110 shadow-lg'
                    : proofStep > idx
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-300'
                }`}
              >
                {proofStep > idx ? "✓" : idx + 1}
              </button>
            ))}
          </div>

          {/* Active Step Details */}
          <div className="p-5 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex gap-4 items-start min-h-[140px] transition-all">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border shadow-sm shrink-0">
              {steps[proofStep].icon}
            </div>
            <div className="space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">{steps[proofStep].title}</h4>
              <p className="text-muted-foreground leading-relaxed">{steps[proofStep].description}</p>
            </div>
          </div>

          {/* Next/Prev buttons */}
          <div className="flex justify-between">
            <button
              disabled={proofStep === 0}
              onClick={() => setProofStep(prev => prev - 1)}
              className="text-xs px-3 py-1.5 border rounded-md font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Previous Step
            </button>
            <button
              disabled={proofStep === steps.length - 1}
              onClick={() => setProofStep(prev => prev + 1)}
              className="text-xs px-3 py-1.5 border rounded-md font-semibold bg-purple-600 text-white border-purple-600 disabled:opacity-40"
            >
              Next Step
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Lemmas Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-500" /> Key Safety Lemmas (20–32)
          </CardTitle>
          <CardDescription className="text-sm">
            The mathematical foundations of Safety. Expand to view proofs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="lemma-21">
              <AccordionTrigger className="text-sm font-semibold">Lemma 21: Fast-Finalization Exclusivity</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> If a block is fast-finalized (≥80% stake), no other block in that slot can be notarized or fallback-certified, and no skip certificate exists.</p>
                <p><strong>Proof Sketch:</strong> 80% voted for block <code>b</code>. Remaining stake is 20%. Since any certificate needs at least 60%, and adversary only controls &lt;20%, honest nodes must contribute. But honest nodes cannot vote twice, so no other certificate can reach 60%.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lemma-23">
              <AccordionTrigger className="text-sm font-semibold">Lemma 23: 40% Notarization Lock</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> If correct nodes with &gt;40% stake notarize block <code>A</code>, no other block <code>B</code> can be notarized in the same slot.</p>
                <p><strong>Proof Sketch:</strong>
                  Let's do the arithmetic:
                  <br />
                  1. Notarization certificate for any block requires at least <code>60%</code> stake.
                  <br />
                  2. Honest nodes with <code>&gt;40%</code> stake voted for <code>A</code>.
                  <br />
                  3. The total remaining stake in the network is <code>&lt;60%</code>.
                  <br />
                  4. Because Byzantine stake is capped at <code>&lt;20%</code>, the maximum votes Block B could get without honest overlap is <code>40% + 20% (Byzantine) = 60%</code>.
                  <br />
                  5. However, since the honest overlap is required, at least one honest node who voted for A would have to vote for B. But honest nodes are restricted to vote at most once (Lemma 20). Thus, Block B can never reach 60%!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lemma-22">
              <AccordionTrigger className="text-sm font-semibold">Lemma 22: FinalVote & Fallback Exclusion</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> A correct node cannot cast both a Finalization Vote and a fallback vote in the same slot.</p>
                <p><strong>Proof Sketch:</strong> Casting a Finalization Vote sets the <code>ItsOver</code> flag, blocking fallback votes. Casting a fallback vote sets <code>BadWindow</code>, blocking Finalization. These flags are set locally before broadcasting, ensuring exclusion.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lemma-25">
              <AccordionTrigger className="text-sm font-semibold">Lemma 25 & 26: Finalized ⟹ Notarized & Slow Exclusivity</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> Any block finalized is also notarized. Slow-finalized blocks are exclusive.</p>
                <p><strong>Proof Sketch:</strong> Fast-finalization requires 80% NotarVotes (which is &gt; 60%, so notarization cert exists). Slow-finalization requires 60% FinalVotes, which are only cast if a notarization cert is observed. Thus, finalization always guarantees notarization.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Liveness Lemmas Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" /> Key Liveness Lemmas (33–42) & Theorem 2
          </CardTitle>
          <CardDescription className="text-sm">
            The mathematical guarantees that Alpenglow will never permanently freeze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="lemma-35">
              <AccordionTrigger className="text-sm font-semibold">Lemma 35 & 37: Timeouts Force Votes & Certificates</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> If all correct nodes set a slot timeout, they will vote. This leads to a skip certificate or &gt;40% notarization.</p>
                <p><strong>Proof Sketch:</strong> When <code>Timeout(s)</code> fires, nodes check if they have voted. If not, they broadcast a <code>SkipVote</code>. Thus, 80%+ stake votes. If no block has 40% support, the <code>SafeToSkip</code> condition triggers fallback skip votes, resolving in a skip cert. Otherwise, a block gets &gt;40% notarization.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="theorem-2">
              <AccordionTrigger className="text-sm font-semibold">Theorem 2: Liveness after GST</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                <p><strong>Statement:</strong> If the leader of a window is correct, and network is synchronous (post-GST), all blocks produced by the leader are finalized.</p>
                <p><strong>Proof Sketch:</strong> We prove by contradiction that no slot is skipped. Since the leader is correct, blocks are received by all correct nodes long before their slot timeouts expire (since <code>Timeout</code> is set to 3Δ + block_offset). Nodes will vote to notarize the block, preventing skip timeouts, leading to fast-finalization.</p>
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 12 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            According to Lemma 23, if correct nodes representing &gt;40% of stake notarize Block A, why is it impossible for Block B in the same slot to also be notarized?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) Because the network automatically slashes Block B's leader immediately.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) Because notarization requires at least 60% stake support. Since &gt;40% correct stake voted for A, only &lt;60% stake remains. To get 60% for B, at least some correct nodes would have to double-vote, which they are coded to never do.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) Because Block A was created first in terms of local clocks.
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
                    <strong>Correct!</strong> Notarization requires a 60% majority. If 40%+ of honest stake voted for Block A, then even if the adversary (capped at &lt;20%) colludes to support Block B, the remaining honest stake is only &lt;40%. Without honest nodes double-voting, Block B can never reach the required 60%.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> The exclusion is not based on active slashing (A) or time of arrival (C), but on simple arithmetic overlap: honest nodes cannot double-vote, locking the consensus path.
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
