import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function TimeoutSimulator() {
  const [isPartitioned, setIsPartitioned] = useState(false);
  const [standstillTimer, setStandstillTimer] = useState(0); // in seconds
  const [currentTimeout, setCurrentTimeout] = useState(1.2); // Base timeout: 1.2s
  const [windowsPassed, setWindowsPassed] = useState(0);

  const baseTimeout = 1.2;
  const standstillThreshold = 10; // seconds

  useEffect(() => {
    let interval: any;

    if (isPartitioned) {
      interval = setInterval(() => {
        setStandstillTimer((prev) => {
          const nextVal = prev + 1;
          
          // Every 1.6 seconds represents a leader window (4 slots of 400ms each)
          // For simplicity in second intervals, let's say every 2 seconds we increment a window
          if (nextVal > standstillThreshold) {
            setWindowsPassed((win) => {
              const nextWin = win + 1;
              // Exponential growth: 5% increase per window
              setCurrentTimeout((base) => base * 1.05);
              return nextWin;
            });
          }
          
          return nextVal;
        });
      }, 1000);
    } else {
      // Snap back to base values on resolution
      setStandstillTimer(0);
      setCurrentTimeout(baseTimeout);
      setWindowsPassed(0);
    }

    return () => clearInterval(interval);
  }, [isPartitioned]);

  const togglePartition = () => {
    setIsPartitioned(!isPartitioned);
  };

  const resetSim = () => {
    setIsPartitioned(false);
    setStandstillTimer(0);
    setCurrentTimeout(baseTimeout);
    setWindowsPassed(0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
          Module 9 Simulator
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Dynamic Timeout & Standstill Simulator
        </h1>
        <p className="text-lg text-muted-foreground">
          Observe how timeouts scale during network failures to guarantee liveness without coordination.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Simulator Controls</CardTitle>
              <CardDescription>Simulate network cuts and observe recovery scaling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={togglePartition}
                variant={isPartitioned ? 'destructive' : 'default'}
                className="w-full text-xs h-9"
              >
                {isPartitioned ? "Resolve Network Partition" : "Inject Network Partition"}
              </Button>
              
              <Button
                onClick={resetSim}
                variant="outline"
                className="w-full text-xs h-9"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" /> Reset
              </Button>
            </CardContent>
          </Card>

          {/* Metrics Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Network Status Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b pb-1">
                <span>Standstill Clock:</span>
                <span className="font-bold text-amber-500">{standstillTimer} seconds</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Windows Missed:</span>
                <span className="font-bold">{windowsPassed} windows</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Current Slot Timeout:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {currentTimeout.toFixed(3)}s
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                Dynamic Timeout Progress Gauge
              </CardTitle>
              <CardDescription>
                Once standstill exceeds 10 seconds, timeout scales exponentially by 5% per window.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-center justify-between gap-4 border ${
                isPartitioned 
                  ? standstillTimer > standstillThreshold
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200"
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200"
                  : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200"
              }`}>
                <div className="flex items-center gap-3">
                  {isPartitioned ? (
                    <AlertOctagon className="h-6 w-6 text-red-500 animate-pulse shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider">
                      {isPartitioned 
                        ? standstillTimer > standstillThreshold
                          ? "Standstill Active - Growing Timeouts"
                          : "Partition Active - Standstill Warning"
                        : "Network Healthy"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {isPartitioned
                        ? standstillTimer > standstillThreshold
                          ? `Exponential growth has triggered. Current multiplier: ${(currentTimeout / baseTimeout).toFixed(2)}x.`
                          : `Standstill clock running. Timeouts will begin scaling in ${standstillThreshold - standstillTimer}s.`
                        : "Consensus is running smoothly. Block times are normal (~400ms)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Standstill Threshold Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Standstill Threshold Countdown ({standstillTimer}s / 10s)</span>
                  <span className="text-muted-foreground">{Math.min((standstillTimer / standstillThreshold) * 100, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min((standstillTimer / standstillThreshold) * 100, 100)} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>

              {/* Staggered Timeout Timeline representation */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Staggered Slot Timeouts in Leader Window</span>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const blockDelay = 0.4; // 400ms per block
                    // Formula: Timeout(i) fires at clock() + currentTimeout + (i - s + 1) * blockDelay
                    const staggeredVal = currentTimeout + (slotIdx + 1) * blockDelay;
                    
                    return (
                      <div key={slotIdx} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between h-20 text-center font-mono">
                        <span className="text-[9px] font-bold text-slate-400">SLOT {slotIdx + 1}</span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {staggeredVal.toFixed(2)}s
                        </span>
                        <span className="text-[8px] text-muted-foreground">
                          +{ (slotIdx + 1) * 400 }ms stagger
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
