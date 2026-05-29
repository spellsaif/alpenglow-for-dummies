import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface NodeState {
  id: string;
  name: string;
  stake: number; // percentage
  status: 'correct' | 'crashed' | 'byzantine';
}

interface ValidatorState {
  id: string;
  name: string;
  shredsCollected: number[]; // indices of shreds collected
  reconstructed: boolean;
  status: 'pending' | 'success' | 'failed';
}

export default function RotorSimulator() {
  // Config
  const [dataShreds, setDataShreds] = useState(8);
  const [totalShreds, setTotalShreds] = useState(12);

  // Simulation speed / running status
  const [isPlaying, setIsPlaying] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0: Idle, 1: Leader->Relays, 2: Relays->Validators, 3: Completed

  // Nodes in our mini-network (6 Relays representing Γ slots, and 4 general validators)
  const [relays, setRelays] = useState<NodeState[]>([
    { id: 'r1', name: 'Relay Alpha', stake: 30, status: 'correct' },
    { id: 'r2', name: 'Relay Beta', stake: 20, status: 'correct' },
    { id: 'r3', name: 'Relay Gamma', stake: 15, status: 'correct' },
    { id: 'r4', name: 'Relay Delta', stake: 15, status: 'crashed' }, // Delta is crashed initially
    { id: 'r5', name: 'Relay Epsilon', stake: 10, status: 'correct' },
    { id: 'r6', name: 'Relay Zeta', stake: 10, status: 'byzantine' }, // Zeta is byzantine initially
  ]);

  const [validators, setValidators] = useState<ValidatorState[]>([
    { id: 'v1', name: 'Validator Zurich', shredsCollected: [], reconstructed: false, status: 'pending' },
    { id: 'v2', name: 'Validator Tokyo', shredsCollected: [], reconstructed: false, status: 'pending' },
    { id: 'v3', name: 'Validator Chicago', shredsCollected: [], reconstructed: false, status: 'pending' },
    { id: 'v4', name: 'Validator Sydney', shredsCollected: [], reconstructed: false, status: 'pending' },
  ]);

  // Log messages for the simulation
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev]);
  };

  const handleStatusChange = (relayId: string, status: 'correct' | 'crashed' | 'byzantine') => {
    if (isPlaying) return;
    setRelays(prev => prev.map(r => r.id === relayId ? { ...r, status } : r));
    addLog(`Changed ${relays.find(r => r.id === relayId)?.name} status to ${status.toUpperCase()}`);
  };

  const resetSim = () => {
    setIsPlaying(false);
    setSimStep(0);
    setValidators(prev => prev.map(v => ({
      ...v,
      shredsCollected: [],
      reconstructed: false,
      status: 'pending'
    })));
    setLogs([]);
    addLog("Simulation reset. Ready to start.");
  };

  const runSimulation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setSimStep(1);
    setLogs([]);
    addLog("Starting Rotor Block Dissemination...");
    addLog(`Leader has split slice into ${dataShreds} data shreds and created ${totalShreds - dataShreds} coding shreds (Total = ${totalShreds}).`);
    addLog("Step 1: Leader is sending shreds to the designated Relay nodes...");
  };

  useEffect(() => {
    if (!isPlaying) return;

    let timer: any;

    if (simStep === 1) {
      // Step 1: Leader sends shreds to relays
      timer = setTimeout(() => {
        setSimStep(2);
        addLog("Step 2: Relays are broadcasting their shreds to all Validators...");
        
        // Calculate which shreds get through to validators
        // Each relay represents a subset of the total shreds.
        // Let's divide the totalShreds (e.g. 12) among the 6 relays based on their stake or index
        // e.g. R1: shreds 0,1. R2: shred 2,3. R3: shred 4,5. R4: shred 6,7. R5: shred 8,9. R6: shred 10,11.
        const shredsPerRelay = Math.ceil(totalShreds / relays.length);
        
        setValidators(prevValidators => {
          return prevValidators.map(val => {
            const collected: number[] = [];
            
            relays.forEach((relay, rIdx) => {
              const startShred = rIdx * shredsPerRelay;
              const endShred = Math.min(startShred + shredsPerRelay, totalShreds);
              
              if (relay.status === 'correct') {
                // Validator successfully receives shreds from correct relays
                for (let s = startShred; s < endShred; s++) {
                  collected.push(s);
                }
              } else if (relay.status === 'byzantine') {
                // Byzantine relay sends corrupted shreds. Validators verify them against Merkle Root and DROP them!
                addLog(`[Security] ${val.name} detected corrupted shreds from ${relay.name}! verification failed, shreds discarded.`);
              } else {
                // Crashed relay sends nothing
                addLog(`[Fault] ${relay.name} is offline. No shreds forwarded.`);
              }
            });

            const uniqueCollected = Array.from(new Set(collected));
            const success = uniqueCollected.length >= dataShreds;

            return {
              ...val,
              shredsCollected: uniqueCollected,
              reconstructed: success,
              status: success ? 'success' : 'failed'
            };
          });
        });
      }, 2000);
    } else if (simStep === 2) {
      // Step 2: Finalize simulation and report outcomes
      timer = setTimeout(() => {
        setSimStep(3);
        setIsPlaying(false);
        addLog("Step 3: Dissemination finished. Checking reconstruction status...");
        
        let allSuccess = true;
        validators.forEach(v => {
          const collectedCount = v.shredsCollected.length;
          if (collectedCount >= dataShreds) {
            addLog(`[Reconstruction] ${v.name} successfully reconstructed the block slice! (${collectedCount}/${dataShreds} shreds).`);
          } else {
            allSuccess = false;
            addLog(`[Liveness Error] ${v.name} failed to reconstruct! Collected only ${collectedCount}/${dataShreds} shreds.`);
          }
        });

        if (allSuccess) {
          addLog("Rotor Success! Every correct node in the network reconstructed the block.");
        } else {
          addLog("Rotor Stall! Some validators could not rebuild the block. Liveness issues detected.");
        }
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, simStep, dataShreds, totalShreds, relays]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 4 Simulator
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Rotor Dissemination Simulator
        </h1>
        <p className="text-lg text-muted-foreground">
          See how erasure-coded blocks are distributed via relays, surviving crash and Byzantine faults.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Simulator Controls</CardTitle>
              <CardDescription>Adjust variables and trigger the run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Data Shreds (γ): {dataShreds}</span>
                </div>
                <Slider
                  value={[dataShreds]}
                  onValueChange={(val) => {
                    setDataShreds(val[0]);
                    resetSim();
                  }}
                  min={4}
                  max={12}
                  step={1}
                  disabled={isPlaying}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Shreds (Γ): {totalShreds}</span>
                  <span className="text-slate-400">κ = {(totalShreds / dataShreds).toFixed(2)}x</span>
                </div>
                <Slider
                  value={[totalShreds]}
                  onValueChange={(val) => {
                    setTotalShreds(Math.max(val[0], dataShreds));
                    resetSim();
                  }}
                  min={dataShreds}
                  max={24}
                  step={1}
                  disabled={isPlaying}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={runSimulation} 
                  disabled={isPlaying || simStep === 3}
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-3 w-3 mr-1.5" /> Start
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

          {/* Console Logs */}
          <Card className="h-[250px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulation Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 p-4 bg-slate-950 text-slate-300 rounded-b-lg border-t">
              {logs.length === 0 ? (
                <span className="text-slate-600">Press Start to begin the dissemination process.</span>
              ) : (
                logs.map((log, i) => {
                  let color = "text-slate-300";
                  if (log.includes("[Security]")) color = "text-amber-400";
                  if (log.includes("[Fault]")) color = "text-rose-400";
                  if (log.includes("[Reconstruction]")) color = "text-emerald-400";
                  if (log.includes("Success!")) color = "text-emerald-400 font-bold";
                  if (log.includes("Stall!")) color = "text-rose-500 font-bold";
                  
                  return <div key={i} className={color}>{log}</div>;
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visual Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                Consensus Topology Visualizer
              </CardTitle>
              <CardDescription>
                Observe shred flow. You can customize the status of the Relays below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* The Topology Map */}
              <div className="relative h-64 bg-slate-50 dark:bg-slate-900 border rounded-lg overflow-hidden flex flex-col justify-between p-6">
                
                {/* Layer 1: Leader */}
                <div className="flex justify-center">
                  <div className="bg-purple-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold flex flex-col items-center shadow-md">
                    <span>Leader Node</span>
                    <span className="text-[9px] font-mono text-purple-200">Creates Block</span>
                  </div>
                </div>

                {/* Layer 2: Relays */}
                <div className="flex justify-around items-center">
                  {relays.map((relay) => {
                    let borderClass = "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950";
                    if (relay.status === 'crashed') {
                      borderClass = "border-rose-400 bg-rose-50 dark:bg-rose-950/20 opacity-60";
                    } else if (relay.status === 'byzantine') {
                      borderClass = "border-amber-400 bg-amber-50 dark:bg-amber-950/20";
                    }

                    return (
                      <div
                        key={relay.id}
                        className={`border rounded-lg p-2 flex flex-col items-center text-center shadow-sm w-20 transition-all select-none ${borderClass}`}
                      >
                        <span className="font-semibold text-[9px]">{relay.name.split(' ')[1]}</span>
                        <span className="text-[8px] font-mono text-muted-foreground">{relay.stake}%</span>
                        <div className="mt-1 flex flex-wrap gap-1 justify-center">
                          {relay.status === 'correct' ? (
                            <Badge className="text-[7px] px-1 py-0 bg-emerald-600 hover:bg-emerald-600 text-white">Correct</Badge>
                          ) : relay.status === 'crashed' ? (
                            <Badge className="text-[7px] px-1 py-0 bg-rose-600 hover:bg-rose-600 text-white">Crash</Badge>
                          ) : (
                            <Badge className="text-[7px] px-1 py-0 bg-amber-500 hover:bg-amber-500 text-white">Malicious</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Layer 3: Validators */}
                <div className="flex justify-around">
                  {validators.map((val) => {
                    let statusIcon = null;
                    let borderClass = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950";
                    
                    if (simStep === 3) {
                      if (val.status === 'success') {
                        statusIcon = <CheckCircle className="h-4 w-4 text-emerald-500" />;
                        borderClass = "border-emerald-500 bg-emerald-50/20";
                      } else {
                        statusIcon = <XCircle className="h-4 w-4 text-rose-500" />;
                        borderClass = "border-rose-500 bg-rose-50/20";
                      }
                    }

                    return (
                      <div
                        key={val.id}
                        className={`border rounded-lg p-2.5 flex flex-col items-center justify-between text-center shadow-sm w-28 transition-all ${borderClass}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-[9px] truncate max-w-[80px]">{val.name.split(' ')[1]}</span>
                          {statusIcon}
                        </div>
                        <div className="mt-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              val.shredsCollected.length >= dataShreds ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min((val.shredsCollected.length / dataShreds) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[8px] mt-1 font-mono text-muted-foreground">
                          {val.shredsCollected.length} / {dataShreds} shreds
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Floating Particles (Simple HTML Mockup overlay during step active) */}
                {isPlaying && simStep === 1 && (
                  <div className="absolute inset-0 bg-purple-500/5 flex items-center justify-center pointer-events-none">
                    <div className="animate-ping bg-purple-500 w-12 h-12 rounded-full opacity-20"></div>
                  </div>
                )}
                {isPlaying && simStep === 2 && (
                  <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center pointer-events-none">
                    <div className="animate-pulse bg-blue-500 w-full h-4 absolute top-[60%] opacity-10"></div>
                  </div>
                )}
              </div>

              {/* Relay customizers */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  Configure Relay Fault Tolerances (Click a button to change state):
                </span>
                <div className="grid gap-4 md:grid-cols-3">
                  {relays.map((relay) => (
                    <div key={relay.id} className="p-3 border rounded-lg bg-white dark:bg-slate-950 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">{relay.name}</span>
                        <span className="font-mono text-slate-400">{relay.stake}% stake</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          onClick={() => handleStatusChange(relay.id, 'correct')}
                          variant={relay.status === 'correct' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-[9px] px-1 h-7"
                          disabled={isPlaying}
                        >
                          Correct
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(relay.id, 'crashed')}
                          variant={relay.status === 'crashed' ? 'destructive' : 'outline'}
                          size="sm"
                          className="flex-1 text-[9px] px-1 h-7"
                          disabled={isPlaying}
                        >
                          Crash
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(relay.id, 'byzantine')}
                          variant={relay.status === 'byzantine' ? 'default' : 'outline'}
                          size="sm"
                          className={`flex-1 text-[9px] px-1 h-7 ${
                            relay.status === 'byzantine' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                          }`}
                          disabled={isPlaying}
                        >
                          Byzantine
                        </Button>
                      </div>
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
