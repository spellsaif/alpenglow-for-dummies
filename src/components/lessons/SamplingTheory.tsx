import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, HelpCircle, BarChart3, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SamplingTheory() {
  const [step, setStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const psSteps = [
    {
      title: "Step 1: Deterministic Bin Assignment",
      desc: "For any large node with stake ρ_i > 1/Γ, we assign ⌊ρ_i · Γ⌋ bins to them directly. This guarantees large stake is represented exactly according to its size, eliminating random variance for whales.",
      badge: "Deterministic"
    },
    {
      title: "Step 2: Bin Partitioning",
      desc: "For smaller nodes, we group their remaining stakes into bins. Each bin is constructed to represent exactly a 1/k stake weight fraction. Nodes can span across multiple bins, but each bin sums to exactly 1/k.",
      badge: "Bin Packing"
    },
    {
      title: "Step 3: Sample 1 Node per Bin",
      desc: "From each bin, we randomly sample exactly one node, proportional to their stake share in that specific bin. Because we take exactly 1 sample per bin, we guarantee we never sample the same node multiple times across bins in a lucky streak.",
      badge: "Stratified Selection"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 11: Smart Sampling Theory
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Smart Sampling: PS-P vs. IID
        </h1>
        <p className="text-lg text-muted-foreground">
          The mathematics of Partition Sampling (PS-P) and why it prevents the adversary from taking over relays.
        </p>
      </div>

      {/* The Marble Bag Analogy */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5" /> The "Marble Bag vs. Egg Carton" Analogy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            When Rotor splits a block into 64 shreds, it must choose 64 validators to act as relays. 
            If the adversary controls 20% of the stake, how do we guarantee they don't get selected 32 times in a single slot?
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>IID (Marble Bag):</strong> Imagine putting colored marbles in a bag. 
              The adversary has 20% red marbles. You pull 64 marbles out, putting each back after drawing. 
              Because each draw is independent, the adversary could get lucky and get 35 red marbles in one round. 
              This is high variance.
            </li>
            <li>
              <strong>PS-P (Egg Carton):</strong> Instead of a bag, you divide the stakes into 64 distinct egg cups (bins). 
              Each egg cup contains exactly 20% red sand and 80% blue sand. You draw exactly one grain from each cup. 
              Because you draw exactly once per cup, it's impossible for the red sand to cluster in one drawing. 
              This minimizes variance.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Step-by-Step PS-P Walkthrough */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="h-5 w-5 text-purple-600" /> PS-P Partition Process (Definition 46)
          </CardTitle>
          <CardDescription className="text-sm">
            Walk through how a validator computes the sampling bins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            {psSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold border ${
                  step === idx
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {idx + 1}. {s.title.split(":")[0]}
              </button>
            ))}
          </div>

          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{psSteps[step].title}</h4>
              <Badge className="bg-purple-500 text-white text-xs uppercase tracking-wider">{psSteps[step].badge}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{psSteps[step].desc}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mathematics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <HelpCircle className="h-5 w-5 text-indigo-500" /> PS-P Mathematical Guarantees
          </CardTitle>
          <CardDescription className="text-sm">
            Theorem 3 & Lemma 47 proofs and equations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <p>
            Why is PS-P mathematically safer than standard IID sampling?
          </p>
          
          <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 space-y-3 font-mono text-sm">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1 font-sans">Definition 45: Partitioning</span>
              A partitioning of stakes into <code>k</code> bins is a mapping <code>p: {"{1..k} × {1..n} → [0,1]"}</code> such that:
              <br />
              • Nodes' stakes sum up: <code>Σ_b p(b,v) = ρ_v</code> for all <code>v</code>.
              <br />
              • Each bin is exactly full: <code>Σ_v p(b,v) = 1/k</code> for all bins.
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1 font-sans">Lemma 47: PS-P Variance Bounds (Hoeffding 1956)</span>
              If all stakes are small (<code>ρ_i &lt; 1/Γ</code>), the probability that the adversary is sampled <code>≥ γ</code> times in PS-P is:
              <div className="text-center font-bold my-2 text-purple-600 dark:text-purple-400">
                P(X_PSP ≥ γ) ≤ P(X_IID ≥ γ)
              </div>
              <p className="font-sans leading-relaxed text-muted-foreground mt-1">
                <strong>Why?</strong> The number of adversary samples in PS-P is a Poisson-binomial distribution (since bins can have different adversary concentrations). Hoeffding proved in 1956 that among all Poisson-binomial distributions, variance is maximized when it is a standard binomial distribution (which is IID). Lower variance means the probability of reaching the dangerous tail (adversary getting ≥ γ slots) is minimized.
              </p>
            </div>
          </div>
          <div className="p-3 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-1 text-sm font-sans">
            <span className="font-sans font-bold text-purple-600 dark:text-purple-400 block">Numerical Variance Comparison:</span>
            Suppose we draw 2 relay nodes, and the adversary controls 20% stake.
            <br />
            • <strong>IID (Bag drawing):</strong> Both draws are from the same 20% distribution. The chance that the adversary gets BOTH slots is: <code>0.20 × 0.20 = 4.0%</code>.
            <br />
            • <strong>PS-P (Egg carton):</strong> We partition the stake into 2 bins. To represent the 20% average, Bin 1 has 10% adversary stake, and Bin 2 has 30% adversary stake. The chance that the adversary gets BOTH slots (1 from each bin) is: <code>0.10 × 0.30 = 3.0%</code>.
            <br />
            <strong>Conclusion:</strong> <code>3.0% &lt; 4.0%</code>. By distributing stakes across custom partitioned bins and sampling exactly once per bin, we reduce the tail probability of the adversary taking over the relays!
          </div>

          <div className="p-4 border border-amber-200 bg-amber-50/10 dark:bg-amber-950/5 rounded-lg flex gap-3 items-start font-sans">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Practical Result:</strong> In Solana Epoch 780, if the adversary controls 40% of the stake (a combination of malicious and crashed nodes), 
              the failure probability of standard IID is relatively high. PS-P drops this probability to <strong>10⁻⁸</strong>, providing institutional-grade liveness guarantees!
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 11 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Why is Partition Sampling (PS-P) mathematically safer than standard Independent and Identically Distributed (IID) sampling?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It guarantees that the largest stake nodes are always selected, which makes it faster.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It groups stakes into bins and draws exactly one sample per bin, reducing selection variance and minimizing the probability of adversary takeover.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It is completely deterministic and doesn't use random seeds at all.
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
                    <strong>Correct!</strong> PS-P works by stratifying the sampling space into bins of equal stake weight and choosing exactly one validator per bin. This mathematical trick dramatically reduces selection variance compared to IID, ensuring the adversary cannot get a lucky cluster.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans">
                    <strong>Incorrect, try again!</strong> Whales (large stake nodes) are handled separately (A) but that's not the primary reason for PS-P. Also, PS-P is still a randomized sampling method (C) using random elements per bin to prevent prediction.
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
