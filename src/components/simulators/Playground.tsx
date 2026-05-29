import { useState, Fragment } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ArrowRight, Database } from 'lucide-react';

interface ValidatorNode {
  id: string;
  name: string;
  stake: number;
  behavior: 'correct' | 'crashed' | 'byzantine';
}

interface BlockChainItem {
  slot: number;
  hash: string;
  status: 'finalized_fast' | 'finalized_slow' | 'skipped';
  parentHash: string;
}

export default function Playground() {
  const [nodes, setNodes] = useState<ValidatorNode[]>([
    { id: 'n1', name: 'Node Zurich', stake: 35, behavior: 'correct' },
    { id: 'n2', name: 'Node Tokyo', stake: 25, behavior: 'correct' },
    { id: 'n3', name: 'Node Chicago', stake: 20, behavior: 'correct' },
    { id: 'n4', name: 'Node Sydney', stake: 12, behavior: 'correct' },
    { id: 'n5', name: 'Node Frankfurt', stake: 8, behavior: 'correct' },
  ]);

  const [chain, setChain] = useState<BlockChainItem[]>([
    { slot: 100, hash: '0xabc', status: 'finalized_fast', parentHash: '0x000' }
  ]);

  const [currentSlot, setCurrentSlot] = useState(101);
  const [simRunning, setSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setSimLogs(prev => [...prev, msg]);
  };

  const handleBehaviorChange = (id: string, behavior: 'correct' | 'crashed' | 'byzantine') => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, behavior } : n));
  };

  const resetPlayground = () => {
    setChain([{ slot: 100, hash: '0xabc', status: 'finalized_fast', parentHash: '0x000' }]);
    setCurrentSlot(101);
    setSimLogs([]);
    setSimRunning(false);
  };

  const runConsensusStep = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimLogs([]);

    addLog(`>>> Initiating consensus for Slot ${currentSlot} <<<`);

    // Determine current leader (for simplicity, cycle through nodes)
    const leaderIdx = (currentSlot - 101) % nodes.length;
    const leader = nodes[leaderIdx];
    
    addLog(`Leader elected by TVRF for Slot ${currentSlot}: ${leader.name} (${leader.stake}% stake)`);

    if (leader.behavior === 'crashed') {
      addLog(`[Liveness Fault] Leader ${leader.name} is crashed! Cannot produce a block.`);
      executeTimeoutTransition();
      return;
    }

    const proposedHash = `0x${Math.random().toString(16).substring(2, 8)}`;
    const lastBlock = chain[chain.length - 1];
    const parentHash = lastBlock.status === 'skipped' ? lastBlock.parentHash : lastBlock.hash;

    addLog(`Leader ${leader.name} proposed block ${proposedHash} built on parent ${parentHash}.`);

    // Notarization round: correct nodes vote notarize, byzantine might vote, crashed don't vote
    setTimeout(() => {
      let notarVotesWeight = 0;
      const voters: string[] = [];

      nodes.forEach(node => {
        if (node.behavior === 'correct') {
          notarVotesWeight += node.stake;
          voters.push(node.name);
        } else if (node.behavior === 'byzantine') {
          // Byzantine randomly votes to simulate support or equivocation
          if (Math.random() > 0.5) {
            notarVotesWeight += node.stake;
            voters.push(`${node.name} (Byzantine: Maliciously Voted)`);
          }
        }
      });

      addLog(`Notarization votes received from: ${voters.join(', ')}.`);
      addLog(`Total Notarization voting stake: ${notarVotesWeight}%.`);

      if (notarVotesWeight >= 80) {
        // Fast finalization
        addLog(`[Success] Voting stake ${notarVotesWeight}% >= 80%. Fast-Finalization Certificate formed.`);
        setChain(prev => [...prev, {
          slot: currentSlot,
          hash: proposedHash,
          status: 'finalized_fast',
          parentHash
        }]);
        setCurrentSlot(prev => prev + 1);
        setSimRunning(false);
      } else if (notarVotesWeight >= 60) {
        // Notarization certificate formed -> Round 2 Finalization voting
        addLog(`[Fallback] Voting stake ${notarVotesWeight}% >= 60% but < 80%. Notarization Certificate formed.`);
        addLog("Casting Round 2 Finalization votes...");

        setTimeout(() => {
          let finalVotesWeight = 0;
          const finalVoters: string[] = [];

          nodes.forEach(node => {
            if (node.behavior === 'correct') {
              finalVotesWeight += node.stake;
              finalVoters.push(node.name);
            }
          });

          addLog(`Finalization votes received from: ${finalVoters.join(', ')}.`);
          addLog(`Total Finalization voting stake: ${finalVotesWeight}%.`);

          if (finalVotesWeight >= 60) {
            addLog(`[Success] Finalization stake ${finalVotesWeight}% >= 60%. Finalization Certificate formed.`);
            setChain(prev => [...prev, {
              slot: currentSlot,
              hash: proposedHash,
              status: 'finalized_slow',
              parentHash
            }]);
          } else {
            addLog(`[Liveness Stall] Finalization stake ${finalVotesWeight}% < 60%. Consensus failed to finalize.`);
            setChain(prev => [...prev, {
              slot: currentSlot,
              hash: 'STALLED',
              status: 'skipped',
              parentHash
            }]);
          }
          setCurrentSlot(prev => prev + 1);
          setSimRunning(false);
        }, 1500);

      } else {
        addLog(`[Liveness Stall] Notarization voting stake ${notarVotesWeight}% < 60%. Standstill timer triggered.`);
        executeTimeoutTransition();
      }

    }, 1500);
  };

  const executeTimeoutTransition = () => {
    addLog("Timeout fired. Running trySkipWindow(). Nodes casting Skip Votes...");
    
    setTimeout(() => {
      let skipVotesWeight = 0;
      nodes.forEach(node => {
        if (node.behavior === 'correct') {
          skipVotesWeight += node.stake;
        }
      });

      addLog(`Total Skip voting stake: ${skipVotesWeight}%.`);

      if (skipVotesWeight >= 60) {
        addLog(`[Fallback] Skip stake ${skipVotesWeight}% >= 60%. Skip Certificate formed. Skipping Slot ${currentSlot}.`);
        const lastBlock = chain[chain.length - 1];
        setChain(prev => [...prev, {
          slot: currentSlot,
          hash: 'SKIPPED',
          status: 'skipped',
          parentHash: lastBlock.status === 'skipped' ? lastBlock.parentHash : lastBlock.hash
        }]);
      } else {
        addLog("[Consensus Deadlock] Skip stake < 60%. Dynamic timeouts must scale before consensus can recover.");
      }
      
      setCurrentSlot(prev => prev + 1);
      setSimRunning(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 10: Sandbox
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Consensus Playground Sandbox
        </h1>
        <p className="text-lg text-muted-foreground">
          Configure a multi-node validator network, inject errors, and see consensus resolve in real-time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Setup & Logs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Node Config */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex justify-between items-center">
                <span>Validator Setup</span>
                <span className="text-xs text-muted-foreground font-mono">Slot {currentSlot}</span>
              </CardTitle>
              <CardDescription>Adjust node behaviors before sending a slot block proposal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {nodes.map(node => (
                  <div key={node.id} className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold">{node.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Weight: {node.stake}%</span>
                    </div>
                    <select
                      value={node.behavior}
                      onChange={(e) => handleBehaviorChange(node.id, e.target.value as any)}
                      className="text-[10px] p-1 border rounded dark:bg-slate-950 dark:border-slate-800"
                      disabled={simRunning}
                    >
                      <option value="correct">Correct</option>
                      <option value="crashed">Crashed</option>
                      <option value="byzantine">Byzantine</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t pt-4">
                <Button
                  onClick={runConsensusStep}
                  disabled={simRunning}
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-3 w-3 mr-1.5" /> Propose Slot
                </Button>
                <Button
                  onClick={resetPlayground}
                  disabled={simRunning}
                  variant="outline"
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Console Log */}
          <Card className="h-[250px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Consensus Ledger Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 p-4 bg-slate-950 text-slate-300 rounded-b-lg border-t">
              {simLogs.length === 0 ? (
                <span className="text-slate-600">Click 'Propose Slot' to execute voting rounds.</span>
              ) : (
                simLogs.map((log, i) => {
                  let color = "text-slate-300";
                  if (log.includes("[Success]")) color = "text-emerald-400 font-bold";
                  if (log.includes("[Fallback]")) color = "text-amber-400";
                  if (log.includes("[Liveness Fault]") || log.includes("[Liveness Stall]")) color = "text-rose-400";
                  return <div key={i} className={color}>{log}</div>;
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visual Blockchain Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-purple-600" /> Active Ledger Chain
                  </CardTitle>
                  <CardDescription>Finalized blocks and skipped slots are stored here.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                {chain.map((block, idx) => {
                  const isLast = idx === chain.length - 1;
                  
                  return (
                    <Fragment key={block.slot}>
                      <div className={`p-4 border rounded-xl shadow-sm w-36 relative transition-all duration-300 ${
                        block.status === 'finalized_fast'
                          ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10"
                          : block.status === 'finalized_slow'
                          ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/10"
                          : "border-red-400 border-dashed bg-rose-50/10 dark:bg-rose-950/10 opacity-70"
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Slot {block.slot}</span>
                          {block.status === 'finalized_fast' && (
                            <Badge className="text-[7px] px-1 py-0 bg-emerald-600 hover:bg-emerald-600 text-white">Fast Path</Badge>
                          )}
                          {block.status === 'finalized_slow' && (
                            <Badge className="text-[7px] px-1 py-0 bg-blue-600 hover:bg-blue-600 text-white">Slow Path</Badge>
                          )}
                          {block.status === 'skipped' && (
                            <Badge className="text-[7px] px-1 py-0 bg-rose-600 hover:bg-rose-600 text-white">Skipped</Badge>
                          )}
                        </div>
                        
                        <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
                          {block.hash}
                        </div>
                        
                        <span className="text-[8px] text-muted-foreground mt-1 font-mono block">
                          P: {block.parentHash}
                        </span>
                      </div>
                      
                      {!isLast && <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />}
                    </Fragment>
                  );
                })}
                
                {simRunning && (
                  <div className="p-4 border border-dashed rounded-xl w-36 flex flex-col items-center justify-center h-[98px] bg-slate-50/50 dark:bg-slate-900/50 animate-pulse border-purple-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent mb-1.5"></div>
                    <span className="text-[9px] text-purple-600 font-semibold uppercase tracking-wider">Consensing...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
