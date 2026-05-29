import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, ShieldCheck, GitCommit } from 'lucide-react';

export default function SamplingSimulator() {
  const [byzStake, setByzStake] = useState(25);
  const [gamma, setGamma] = useState(32);
  const [gammaTotal, setGammaTotal] = useState(64);
  const [distType, setDistType] = useState<'solana' | 'uniform' | 'whales'>('solana');
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    iidFailures: number;
    pspFailures: number;
    trials: number;
  } | null>(null);

  // Generate stake distributions (sum = 100%)
  const getStakeDistribution = () => {
    // We split the correct stake among validators
    const correctStake = 100 - byzStake;
    
    if (distType === 'uniform') {
      // 20 validators with uniform stake
      const list: { id: string; type: 'correct' | 'byzantine'; stake: number }[] = Array.from({ length: 20 }, (_, i) => ({
        id: `node_${i}`,
        type: 'correct',
        stake: correctStake / 20,
      }));
      list.push({ id: 'adversary', type: 'byzantine', stake: byzStake });
      return list;
    } else if (distType === 'whales') {
      // 3 Whales with high stake, others with tiny stake
      const whaleStake = correctStake * 0.7; // Whales hold 70% of correct stake
      const smallStake = correctStake * 0.3;
      const list: { id: string; type: 'correct' | 'byzantine'; stake: number }[] = [
        { id: 'whale_1', type: 'correct', stake: whaleStake / 3 },
        { id: 'whale_2', type: 'correct', stake: whaleStake / 3 },
        { id: 'whale_3', type: 'correct', stake: whaleStake / 3 },
      ];
      for (let i = 0; i < 15; i++) {
        list.push({ id: `small_${i}`, type: 'correct', stake: smallStake / 15 });
      }
      list.push({ id: 'adversary', type: 'byzantine', stake: byzStake });
      return list;
    } else {
      // Solana real Epoch 780 style distribution (Power law)
      const list: { id: string; type: 'correct' | 'byzantine'; stake: number }[] = [];
      const validatorCount = 30;
      let totalPower = 0;
      for (let i = 1; i <= validatorCount; i++) {
        totalPower += 1 / Math.sqrt(i);
      }
      for (let i = 1; i <= validatorCount; i++) {
        const share = (1 / Math.sqrt(i)) / totalPower;
        list.push({
          id: `validator_${i}`,
          type: 'correct' as const,
          stake: share * correctStake
        });
      }
      list.push({ id: 'adversary', type: 'byzantine' as const, stake: byzStake });
      return list;
    }
  };

  const runSimulation = () => {
    setIsRunning(true);
    setResults(null);

    // Run Monte Carlo simulation in setTimeout to prevent UI blocking
    setTimeout(() => {
      const distribution = getStakeDistribution();
      const trials = 1000;
      let iidFailures = 0;
      let pspFailures = 0;

      // 1. IID Sampling: Draw gammaTotal samples independently
      for (let t = 0; t < trials; t++) {
        let advCount = 0;
        for (let i = 0; i < gammaTotal; i++) {
          const rand = Math.random() * 100;
          let cumulative = 0;
          for (const node of distribution) {
            cumulative += node.stake;
            if (rand <= cumulative) {
              if (node.type === 'byzantine') advCount++;
              break;
            }
          }
        }
        // Failure if adversary controls more than gammaTotal - gamma slots
        // (meaning correct nodes have < gamma slots, failing reconstruction)
        if (advCount > (gammaTotal - gamma)) {
          iidFailures++;
        }
      }

      // 2. PS-P Sampling (Poisson-binomial representation)
      // Step 1: Assign deterministic slots to large nodes with stake > 1/gammaTotal
      // For simplicity, we model the bin probability logic mathematically
      const binCapacity = 100 / gammaTotal; // e.g. 100% / 64 = 1.56%
      
      const deterministicSlots: Record<string, number> = {};
      let remainingStakeSum = 100;
      let remainingGammaTotal = gammaTotal;

      distribution.forEach(node => {
        if (node.stake > binCapacity) {
          const slots = Math.floor(node.stake / binCapacity);
          deterministicSlots[node.id] = slots;
          remainingStakeSum -= slots * binCapacity;
          remainingGammaTotal -= slots;
        }
      });

      // Step 2: Sample remaining slots using Poisson-binomial bins
      // For each remaining slot, we draw from nodes who have residual stakes
      for (let t = 0; t < trials; t++) {
        let advCount = deterministicSlots['adversary'] || 0;
        
        for (let i = 0; i < remainingGammaTotal; i++) {
          // Sample a node from the residual distribution
          const rand = Math.random() * remainingStakeSum;
          let cumulative = 0;
          for (const node of distribution) {
            // Calculate residual stake
            const det = deterministicSlots[node.id] || 0;
            const residual = node.stake - (det * binCapacity);
            cumulative += residual;
            if (rand <= cumulative) {
              if (node.type === 'byzantine') advCount++;
              break;
            }
          }
        }

        if (advCount > (gammaTotal - gamma)) {
          pspFailures++;
        }
      }

      setResults({
        iidFailures,
        pspFailures,
        trials
      });
      setIsRunning(false);
    }, 100);
  };

  const distribution = getStakeDistribution();
  const sortedDist = [...distribution].sort((a, b) => b.stake - a.stake);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 8 Simulator
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          PS-P Smart Sampling Simulator
        </h1>
        <p className="text-lg text-muted-foreground">
          Compare independent (IID) sampling against Alpenglow's Partition Sampling (PS-P).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Parameters Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Sampling Settings</CardTitle>
              <CardDescription>Configure parameters for the Monte Carlo test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Stake Distribution:</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {(['solana', 'uniform', 'whales'] as const).map(type => (
                    <Button
                      key={type}
                      onClick={() => { setDistType(type); setResults(null); }}
                      variant={distType === type ? 'default' : 'outline'}
                      className={`justify-start text-xs h-8 ${
                        distType === type ? 'bg-purple-600 hover:bg-purple-700' : ''
                      }`}
                      disabled={isRunning}
                    >
                      {type === 'solana' && "Solana Epoch 780 Style"}
                      {type === 'uniform' && "Uniform Node Stakes"}
                      {type === 'whales' && "Whale-Heavy Stakes"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Adversary (Byzantine) Stake: {byzStake}%</span>
                </div>
                <Slider
                  value={[byzStake]}
                  onValueChange={(val: number[]) => { setByzStake(val[0]); setResults(null); }}
                  min={5}
                  max={45}
                  step={1}
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Required Relays (γ): {gamma}</span>
                </div>
                <Slider
                  value={[gamma]}
                  onValueChange={(val: number[]) => { setGamma(val[0]); setResults(null); }}
                  min={8}
                  max={gammaTotal}
                  step={1}
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Relays (Γ): {gammaTotal}</span>
                </div>
                <Slider
                  value={[gammaTotal]}
                  onValueChange={(val: number[]) => {
                    setGammaTotal(val[0]);
                    setGamma(Math.min(gamma, val[0]));
                    setResults(null);
                  }}
                  min={16}
                  max={128}
                  step={4}
                  disabled={isRunning}
                />
              </div>

              <Button
                onClick={runSimulation}
                disabled={isRunning}
                className="w-full text-xs bg-purple-600 hover:bg-purple-700 mt-2"
              >
                <Play className="h-3 w-3 mr-1.5" /> Run 1,000 Trials
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts or Metrics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                Monte Carlo Simulation Results
              </CardTitle>
              <CardDescription>
                Compare failure rates. Failure = Byzantine control &ge; (Γ - γ + 1) relays, stalling reconstruction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isRunning ? (
                <div className="h-44 flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                  <span className="text-xs text-muted-foreground">Running trials...</span>
                </div>
              ) : results ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* IID results */}
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between items-center text-center space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase">Standard IID Sampling</span>
                    <div className="text-3xl font-extrabold text-red-500">
                      {((results.iidFailures / results.trials) * 100).toFixed(2)}%
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Consensus failures: {results.iidFailures} / {results.trials} trials
                    </span>
                    <Badge variant="outline" className="text-[9px] border-red-200 text-red-600 bg-red-50 dark:bg-red-950/20">
                      High Variance Risks
                    </Badge>
                  </div>

                  {/* PS-P results */}
                  <div className="border rounded-lg p-4 bg-purple-50/20 dark:bg-purple-950/5 border-purple-200 dark:border-purple-950 flex flex-col justify-between items-center text-center space-y-3">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">PS-P Partition Sampling</span>
                    <div className="text-3xl font-extrabold text-emerald-500">
                      {((results.pspFailures / results.trials) * 100).toFixed(2)}%
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Consensus failures: {results.pspFailures} / {results.trials} trials
                    </span>
                    {results.pspFailures < results.iidFailures ? (
                      <Badge className="text-[9px] bg-emerald-600 hover:bg-emerald-600 text-white flex gap-1 items-center">
                        <ShieldCheck className="h-3 w-3" /> safer than iid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">Comparable Performance</Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-44 border border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                  Click 'Run 1,000 Trials' to view comparative statistics.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bins Visualization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Understanding the PS-P Bin Partitioning (Concept)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                By dividing total stake into bins of size <code>1/&Gamma;</code> (e.g. { (100 / gammaTotal).toFixed(2) }% stake), 
                large validator stakes are allocated deterministically to bins, preventing them from being multi-drawn by luck. 
                Remaining stakes are partitioned randomly.
              </p>
              
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-semibold block">Largest Validators in network:</span>
                <div className="flex gap-2 flex-wrap">
                  {sortedDist.slice(0, 6).map((node, i) => (
                    <div 
                      key={i} 
                      className={`text-[9px] border px-2 py-1 rounded flex items-center gap-1.5 font-mono ${
                        node.type === 'byzantine'
                          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-600"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200"
                      }`}
                    >
                      <GitCommit className="h-3 w-3" />
                      <span>{node.id.replace('_', ' ')}:</span>
                      <span className="font-bold">{node.stake.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
