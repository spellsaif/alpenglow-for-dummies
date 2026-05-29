import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock, Network, Users, ShieldAlert, Cpu, Activity, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

export default function SystemModel() {
  const [networkDelay, setNetworkDelay] = useState(150); // in ms
  const [clockDrift, setClockDrift] = useState(20); // in ppm
  const [gstActive, setGstActive] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Time calculations
  const baseDelta = 400; // max delay Delta
  const driftSec = (400 * clockDrift) / 1000000; // clock drift in ms per slot
  const actualArrival = gstActive 
    ? Math.min(baseDelta, networkDelay) + driftSec
    : networkDelay + driftSec;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 2: System Model
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          System Model & Assumptions
        </h1>
        <p className="text-lg text-muted-foreground">
          The architectural guidelines, network limits, and security boundaries of Alpenglow.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Compass className="h-5 w-5 animate-pulse" /> ELI5: The Rules of the Playground
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Before we can play a fair game of blockchain consensus, we need to agree on some absolute boundaries. 
            Imagine a global chess tournament played online. To ensure fairness, we must lay down tournament rules:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li><strong>The Round Time (Slots):</strong> Players get exactly 400 milliseconds to make a move.</li>
            <li><strong>The Clock Sync (Clock Drift):</strong> If one player's watch is 1 millisecond fast, it shouldn't ruin the game.</li>
            <li><strong>Packet Rules (UDP limits):</strong> To keep moves streaming instantly, players can only send moves that fit on a single standard postcard.</li>
          </ul>
          <p>
            By setting these boundaries (the "System Model"), Alpenglow can guarantee mathematical safety even if hackers try to delay postcards in transit!
          </p>
        </CardContent>
      </Card>

      {/* World Computer Motivation */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg">
            <Cpu className="h-5 w-5" /> The "World Computer" Concept
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Blockchains operate as a single virtual machine (a <strong>"World Computer"</strong>) distributed across thousands of nodes worldwide.
          </p>
          <p>
            Unlike a database run on AWS by a single company, the World Computer must:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Run correctly even when nodes are operated by anonymous, potentially hostile actors.</li>
            <li>Remain operational when parts of the global network fail or experience severe delays.</li>
            <li>Ensure all honest nodes eventually agree on every executed transaction.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Core Components Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Epochs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Clock className="h-4 w-4 text-purple-600" /> 1. Epoch Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Time is chunked into <strong>Epochs</strong> (e.g., L = 18,000 slots, about 2 hours). 
              Within an epoch, the set of nodes and their stake fractions are <strong>frozen</strong>.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded font-mono text-xs space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">The 2-Epoch Rule:</span>
              <p>Stakes for Epoch <code>e + 1</code> are finalized and locked at the end of Epoch <code>e - 1</code>.</p>
              <p className="text-xs text-purple-500">Why? This guarantees all nodes agree on the participant set before starting the next epoch, preventing splits.</p>
            </div>
          </CardContent>
        </Card>

        {/* Nodes and Stakes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-4 w-4 text-purple-600" /> 2. Nodes & Stakes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Solana currently has <code>n ≈ 1,300–1,500</code> nodes (capped at <code>n_max = 2,000</code>).
              Each node has a public key, IP/port, and a stake fraction <code>ρ_i &gt; 0</code> (where sum = 100%).
            </p>
            <p>
              Stakes determine: <strong>voting weight</strong>, block rewards, and expected <strong>Rotor relay bandwidth contribution</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Network className="h-4 w-4 text-purple-600" /> 3. UDP Packet Constraints
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              To maintain extreme speed, all messages must be <strong>≤ 1,500 bytes</strong> (fitting inside a single standard IP packet/UDP datagram).
            </p>
            <p>
              This avoids <strong>IP fragmentation</strong>, which causes packets to get dropped.
              Alpenglow uses <strong>QUIC-UDP</strong> or UDP with per-pair MAC (message authentication codes) for low overhead.
            </p>
          </CardContent>
        </Card>

        {/* Clocks & TVRF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Cpu className="h-4 w-4 text-purple-600" /> 4. Clock Drift & TVRF
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Nodes do <strong>not</strong> need globally synchronized wall clocks. Standard local clock drift (up to 50 ppm, or parts-per-million) 
              is absorbed by timeouts. Slots are just sequential integers.
            </p>
            <div className="p-2 bg-purple-50/20 dark:bg-purple-950/10 border rounded text-xs space-y-1">
              <strong>Clock Drift Arithmetic:</strong> 50 ppm (parts-per-million) means a clock loses or gains at most 50 seconds for every 1,000,000 seconds. 
              For a 400 millisecond slot, the maximum drift is only <code>0.00002 seconds (0.02 milliseconds)</code>! This is why clock drift is negligible.
            </div>
            <p>
              A <strong>Threshold Verifiable Random Function (TVRF)</strong> computes the leader schedule before the epoch. 
              The schedule is public, but unpredictable in advance, making it hard to target leaders with DDoS attacks.
            </p>
            <div className="p-2 bg-purple-50/20 dark:bg-purple-950/10 border rounded text-xs space-y-1">
              <strong>TVRF Analogy:</strong> Like drawing lottery ticket winners using a transparent lottery machine. Anyone can watch the draw and verify it is 100% fair and mathematically sound, but nobody could have predicted who would win until the numbers were drawn.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Delay Simulation Widget */}
      <Card className="border-purple-200 dark:border-purple-900 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Activity className="h-5 w-5" /> Interactive Delay & Clock Drift Simulator
          </CardTitle>
          <CardDescription className="text-sm">
            See how clock drift and message latency affect whether packets arrive within the maximum delay parameter (Δ = 400ms).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border">
            {/* Slider 1: Latency */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Actual Latency (δ): {networkDelay} ms</label>
              <Slider
                value={[networkDelay]}
                onValueChange={(val) => setNetworkDelay(val[0])}
                min={10}
                max={800}
                step={10}
              />
            </div>

            {/* Slider 2: Clock Drift */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 block">Clock Drift: {clockDrift} PPM</label>
              <Slider
                value={[clockDrift]}
                onValueChange={(val) => setClockDrift(val[0])}
                min={0}
                max={500}
                step={10}
              />
            </div>

            {/* Switch: GST */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-xs font-semibold text-slate-500">Global Stabilization Time (GST)</span>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  variant={gstActive ? "default" : "outline"}
                  onClick={() => setGstActive(!gstActive)}
                  className={`text-xs ${gstActive ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  {gstActive ? "GST Active (Synchronous)" : "GST Inactive (Asynchronous)"}
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Total Travel Time: {actualArrival.toFixed(2)} ms</span>
              <span>Max Safe Delay (Δ): 400 ms</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 flex items-center justify-end pr-2 text-xs font-bold text-white ${
                  actualArrival <= baseDelta ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (actualArrival / baseDelta) * 100)}%` }}
              >
                {actualArrival.toFixed(0)}ms
              </div>
              <div className="absolute right-0 top-0 h-full w-0.5 bg-red-600" style={{ left: '50%' }}></div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {actualArrival <= baseDelta ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Packet arrives safely within the consensus window.</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">⚠ Packet delayed! Under GST, maximum delays are capped at 400ms. In asynchronous phases, it can stall.</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partial Synchrony Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" /> The Adversary & Partial Synchrony (GST Model)
          </CardTitle>
          <CardDescription>How Alpenglow achieves mathematical security under network attack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Alpenglow runs under the <strong>Partial Synchrony System Model</strong>. 
            This splits network lifetime into two distinct phases:
          </p>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase">1. Pre-GST Phase (Asynchronous)</h4>
              <p className="text-muted-foreground">
                Before an unknown time <strong>GST</strong> (Global Stabilization Time), the network can be controlled by an active adversary. 
                Messages can be delayed indefinitely or reordered. 
                <strong className="text-rose-600 dark:text-rose-400"> Safety (no forks) always holds</strong>, but the blockchain might temporarily stall (lose liveness).
              </p>
            </div>
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase">2. Post-GST Phase (Synchronous)</h4>
              <p className="text-muted-foreground">
                After GST, the network returns to healthy behavior. 
                All messages sent between honest nodes are guaranteed to arrive in at most <code>Δ</code> (conservatively set to <code>400 ms</code>). 
                Both <strong className="text-emerald-600 dark:text-emerald-400">Safety and Liveness</strong> are fully guaranteed.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This design ensures that even if a global router outage delays validator messages for minutes, 
            <strong> no user transactions are double-spent or reversed</strong>. The blockchain simply waits and catches up when connection returns.
          </p>
        </CardContent>
      </Card>

      {/* Concept Check Quiz */}
      <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/15 dark:bg-purple-950/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Concept Check: What did you learn?
          </CardTitle>
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 2 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Under the Partial Synchrony (GST) system model, what happens if a physical fiber cut delays consensus messages for several minutes?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) The blockchain splits into two permanent versions (forks) so both groups keep working.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) The network remains 100% safe (no forks), but might temporarily stall until the physical connection is repaired.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) The transaction fees double automatically to discourage user traffic during the delay.
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
                    <strong>Correct!</strong> Partial synchrony guarantees that <strong>Safety (no forks) always holds</strong> even during active delays (pre-GST). The network just pauses transaction finalization temporarily, and safely catches up once connection returns.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Incorrect, try again!</strong> Blockchains must avoid permanent splits (A) at all costs to prevent double-spending. Alpenglow has no automatic fee-adjusting rules based on local delay (C).
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
