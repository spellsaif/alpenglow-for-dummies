import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkipForward, RotateCcw, Award } from 'lucide-react';

interface VoteEvent {
  type: 'notar' | 'final' | 'skip' | 'notar-fallback' | 'skip-fallback';
  from: string;
  weight: number;
}

export default function VotorSimulator() {
  const [scenario, setScenario] = useState<'fast' | 'slow' | 'skip'>('fast');
  const [step, setStep] = useState(0); // 0: Start, 1: Initial Vote, 2: Cert Check, 3: Finalize (or 2nd vote), 4: Complete
  const [nodeStates, setNodeStates] = useState<Record<string, string[]>>({
    Zurich: ['ParentReady'],
    Tokyo: ['ParentReady'],
    Chicago: ['ParentReady'],
    Sydney: ['ParentReady'],
  });

  const [votesPool, setVotesPool] = useState<VoteEvent[]>([]);
  const [certsPool, setCertsPool] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Node stakes
  const nodeStakes: Record<string, number> = {
    Zurich: 40,
    Tokyo: 25,
    Chicago: 20,
    Sydney: 15,
  };

  const getScenarioConfig = () => {
    switch (scenario) {
      case 'fast':
        return {
          title: "High Support (>= 80%)",
          desc: "All nodes are active and correct. The Fast-Finalization path triggers.",
          votes: [
            { type: 'notar', from: 'Zurich', weight: 40 },
            { type: 'notar', from: 'Tokyo', weight: 25 },
            { type: 'notar', from: 'Chicago', weight: 20 },
            { type: 'notar', from: 'Sydney', weight: 15 },
          ] as VoteEvent[]
        };
      case 'slow':
        return {
          title: "Medium Support (60% - 80%)",
          desc: "Sydney is crashed (15%). Zurich, Tokyo, and Chicago are online (85% total, but only 65% vote initially). Falls back to 2-round finalization.",
          votes: [
            { type: 'notar', from: 'Zurich', weight: 40 },
            { type: 'notar', from: 'Tokyo', weight: 25 },
          ] as VoteEvent[]
        };
      case 'skip':
        return {
          title: "Low Support (< 60%)",
          desc: "Zurich is crashed (40%). Active correct nodes (60% total) timeout and skip the slot.",
          votes: [
            { type: 'skip', from: 'Tokyo', weight: 25 },
            { type: 'skip', from: 'Chicago', weight: 20 },
            { type: 'skip', from: 'Sydney', weight: 15 },
          ] as VoteEvent[]
        };
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const resetSim = () => {
    setStep(0);
    setNodeStates({
      Zurich: ['ParentReady'],
      Tokyo: ['ParentReady'],
      Chicago: ['ParentReady'],
      Sydney: ['ParentReady'],
    });
    setVotesPool([]);
    setCertsPool([]);
    setLogs([]);
  };

  const nextStep = () => {
    const config = getScenarioConfig();
    const newStep = step + 1;
    setStep(newStep);

    if (newStep === 1) {
      // Step 1: Nodes receive block event and cast initial vote
      addLog("Event: Block(slot 101, hash_A, parent_0) received.");
      
      const newStates = { ...nodeStates };
      const votes: VoteEvent[] = [];

      if (scenario === 'fast') {
        config.votes.forEach(v => {
          newStates[v.from] = [...newStates[v.from], 'Voted', 'VotedNotar(hash_A)'];
          votes.push(v);
          addLog(`${v.from} executed tryNotar(): cast Notarization Vote for hash_A (weight: ${v.weight}%)`);
        });
      } else if (scenario === 'slow') {
        // Only Zurich and Tokyo vote immediately
        config.votes.forEach(v => {
          newStates[v.from] = [...newStates[v.from], 'Voted', 'VotedNotar(hash_A)'];
          votes.push(v);
          addLog(`${v.from} executed tryNotar(): cast Notarization Vote for hash_A (weight: ${v.weight}%)`);
        });
        addLog("Chicago is slow to respond. Sydney is offline.");
      } else {
        // Skip scenario
        config.votes.forEach(v => {
          newStates[v.from] = [...newStates[v.from], 'Voted', 'BadWindow'];
          votes.push(v);
          addLog(`Timeout fired! ${v.from} executed trySkipWindow(): cast Skip Vote for slot 101 (weight: ${v.weight}%)`);
        });
      }

      setNodeStates(newStates);
      setVotesPool(votes);
    } 
    
    else if (newStep === 2) {
      // Step 2: Pool checks vote thresholds and generates certificates
      addLog("Pool is evaluating active vote weights...");
      
      const totalWeight = votesPool.reduce((acc, v) => acc + v.weight, 0);
      const newCerts = [...certsPool];

      if (scenario === 'fast') {
        addLog(`Total NotarVotes in Pool: ${totalWeight}% (>= 80% threshold).`);
        newCerts.push('Fast-Finalization Certificate', 'Notarization Certificate');
        addLog("Success! Pool generated and broadcasted Fast-Finalization Certificate.");
        setCertsPool(newCerts);

        // Nodes process Fast Finalization Cert
        const newStates = { ...nodeStates };
        Object.keys(newStates).forEach(node => {
          newStates[node] = [...newStates[node], 'BlockNotarized(hash_A)', 'Finalized (Fast)'];
        });
        setNodeStates(newStates);
      } else if (scenario === 'slow') {
        addLog(`Total NotarVotes in Pool: ${totalWeight}% (>= 60% threshold, < 80% threshold).`);
        newCerts.push('Notarization Certificate');
        addLog("Success! Pool generated and broadcasted Notarization Certificate.");
        setCertsPool(newCerts);

        const newStates = { ...nodeStates };
        // Correct nodes update state flags
        ['Zurich', 'Tokyo'].forEach(node => {
          newStates[node] = [...newStates[node], 'BlockNotarized(hash_A)'];
        });
        setNodeStates(newStates);
      } else {
        addLog(`Total SkipVotes in Pool: ${totalWeight}% (>= 60% threshold).`);
        newCerts.push('Skip Certificate');
        addLog("Success! Pool generated and broadcasted Skip Certificate.");
        setCertsPool(newCerts);

        const newStates = { ...nodeStates };
        ['Tokyo', 'Chicago', 'Sydney'].forEach(node => {
          newStates[node] = [...newStates[node], 'Skipped'];
        });
        setNodeStates(newStates);
      }
    } 
    
    else if (newStep === 3) {
      // Step 3: Fast-finalization completes. Slow-finalization starts round 2.
      if (scenario === 'fast') {
        addLog("Block hash_A is now fast-finalized by all correct nodes.");
        setStep(4); // Skip to completion
      } else if (scenario === 'slow') {
        addLog("Starting Round 2 (Finalization voting)...");
        addLog("Nodes Zurich and Tokyo check tryFinal() conditions: personally voted to notarize AND seen Notarization Cert AND not in BadWindow.");
        
        const newStates = { ...nodeStates };
        const newVotes = [...votesPool];

        ['Zurich', 'Tokyo'].forEach(node => {
          newStates[node] = [...newStates[node], 'ItsOver'];
          newVotes.push({ type: 'final', from: node, weight: nodeStakes[node] });
          addLog(`${node} cast Finalization Vote for slot 101 (weight: ${nodeStakes[node]}%)`);
        });

        setNodeStates(newStates);
        setVotesPool(newVotes);
      } else {
        addLog("Slot 101 skipped successfully. Moving to slot 102.");
        setStep(4);
      }
    } 
    
    else if (newStep === 4) {
      // Step 4: Final Cert and Completion for slow path
      if (scenario === 'slow') {
        const finalVotes = votesPool.filter(v => v.type === 'final');
        const finalWeight = finalVotes.reduce((acc, v) => acc + v.weight, 0);

        addLog(`Total Finalization Votes in Pool: ${finalWeight}% (>= 60% threshold).`);
        const newCerts = [...certsPool, 'Finalization Certificate'];
        setCertsPool(newCerts);
        addLog("Success! Pool generated and broadcasted Finalization Certificate.");

        const newStates = { ...nodeStates };
        Object.keys(newStates).forEach(node => {
          if (node !== 'Sydney') { // Sydney is crashed
            newStates[node] = [...newStates[node], 'Finalized (Slow)'];
          }
        });
        setNodeStates(newStates);
        addLog("Block hash_A is now slow-finalized by all online nodes.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 6 Simulator
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Votor Consensus Engine Simulator
        </h1>
        <p className="text-lg text-muted-foreground">
          Step through Votor's two-path finalization logic and inspect local validator variables.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenarios & Steps */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Consensus Scenario</CardTitle>
              <CardDescription>Select support rate to test different finalization paths.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {(['fast', 'slow', 'skip'] as const).map(scen => (
                  <Button
                    key={scen}
                    onClick={() => {
                      setScenario(scen);
                      resetSim();
                    }}
                    variant={scenario === scen ? 'default' : 'outline'}
                    className={`justify-start text-xs h-9 ${
                      scenario === scen ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                    disabled={step > 0}
                  >
                    {scen === 'fast' && "Fast Path (80% Support)"}
                    {scen === 'slow' && "Slow Path (60% Support)"}
                    {scen === 'skip' && "Skip Path (Timeout)"}
                  </Button>
                ))}
              </div>

              <div className="border-t pt-4 flex gap-2">
                <Button
                  onClick={nextStep}
                  disabled={step === 4 || (scenario === 'fast' && step === 3)}
                  className="flex-1 text-xs"
                >
                  <SkipForward className="h-3 w-3 mr-1.5" /> Next Step
                </Button>
                <Button
                  onClick={resetSim}
                  variant="outline"
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Console Output */}
          <Card className="h-[250px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consensus Event Console
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 p-4 bg-slate-950 text-slate-300 rounded-b-lg border-t">
              {logs.length === 0 ? (
                <span className="text-slate-600">Select a scenario and click Next Step.</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={
                    log.startsWith("Success!") ? "text-emerald-400 font-bold" :
                    log.startsWith("Event:") ? "text-blue-400" :
                    log.startsWith("Timeout") ? "text-amber-400" : "text-slate-300"
                  }>
                    {log}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visual Map & Pools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Node States Grid */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                Local Validator State Variables
              </CardTitle>
              <CardDescription>
                Track individual variables stored in <code>state[slot]</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.keys(nodeStates).map((node) => {
                  const states = nodeStates[node];
                  const stake = nodeStakes[node];
                  return (
                    <div key={node} className="p-3 border rounded-lg bg-white dark:bg-slate-950 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">{node} Validator</span>
                        <span className="font-mono text-slate-400">{stake}% stake</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {states.map((st, i) => {
                          let badgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                          if (st.includes("Finalized")) badgeColor = "bg-emerald-600 text-white";
                          if (st.includes("Skipped")) badgeColor = "bg-rose-600 text-white";
                          if (st.includes("VotedNotar")) badgeColor = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
                          if (st.includes("ItsOver")) badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
                          
                          return (
                            <Badge key={i} className={`text-[9px] font-mono px-1.5 py-0.5 ${badgeColor}`}>
                              {st}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Aggregate Pools */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Votes Pool */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pool: Votes Store
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {votesPool.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">No votes cast yet.</span>
                ) : (
                  votesPool.map((v, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-1 font-mono text-[10px]">
                      <span>{v.from}</span>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="text-[9px] uppercase">
                          {v.type}
                        </Badge>
                        <span className="font-bold">{v.weight}%</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Certificates Pool */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pool: Certificate Store
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {certsPool.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">No certificates generated yet.</span>
                ) : (
                  certsPool.map((c, i) => (
                    <div 
                      key={i} 
                      className="p-2 border border-purple-200 dark:border-purple-950 bg-purple-50/50 dark:bg-purple-950/20 rounded flex items-center gap-2 text-xs font-semibold"
                    >
                      <Award className="h-4 w-4 text-purple-600" />
                      <span>{c}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
