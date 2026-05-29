import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldCheck, Cpu, Key, HelpCircle, Activity, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface GraphPoint {
  id: number;
  x: number;
  y: number;
}

export default function Cryptography() {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  // Reed-Solomon simulator state
  const [message, setMessage] = useState("MASTERING-ALPENGLOW-CONSENSUS-IS-EASY!");
  const [dataShreds, setDataShreds] = useState(4);
  const [totalShreds, setTotalShreds] = useState(8);
  const [droppedShreds, setDroppedShreds] = useState<Record<number, boolean>>({});

  // Ensure totalShreds >= dataShreds
  const adjustedTotal = Math.max(totalShreds, dataShreds);
  const expansionRatio = (adjustedTotal / dataShreds).toFixed(2);

  // Divide message into dataShreds pieces
  const pieces = useMemo(() => {
    const chunkLength = Math.ceil(message.length / dataShreds);
    const result: string[] = [];
    for (let i = 0; i < dataShreds; i++) {
      const start = i * chunkLength;
      const part = message.substring(start, start + chunkLength);
      result.push(part.padEnd(chunkLength, '_'));
    }
    return result;
  }, [message, dataShreds]);

  // Generate coding shreds
  const codingPieces = useMemo(() => {
    const count = adjustedTotal - dataShreds;
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const parityBase = pieces.map(p => p[i % p.length] || '*').join('');
      result.push(`[P-${i + 1}:${parityBase}]`);
    }
    return result;
  }, [pieces, dataShreds, adjustedTotal]);

  const allShreds = useMemo(() => {
    const list: { index: number; type: 'data' | 'coding'; content: string }[] = [];
    for (let i = 0; i < dataShreds; i++) {
      list.push({ index: i, type: 'data', content: pieces[i] });
    }
    const codingCount = adjustedTotal - dataShreds;
    for (let i = 0; i < codingCount; i++) {
      list.push({ index: dataShreds + i, type: 'coding', content: codingPieces[i] });
    }
    return list;
  }, [pieces, codingPieces, dataShreds, adjustedTotal]);

  const toggleDropShred = (idx: number) => {
    setDroppedShreds(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const activeCount = allShreds.filter(s => !droppedShreds[s.index]).length;
  const isReconstructible = activeCount >= dataShreds;

  const reconstructedMessage = useMemo(() => {
    if (!isReconstructible) {
      const chunkLength = pieces[0]?.length || 0;
      let mock = "";
      for (let i = 0; i < dataShreds; i++) {
        if (droppedShreds[i] && allShreds.filter(s => s.type === 'coding' && !droppedShreds[s.index]).length === 0) {
          mock += "?".repeat(chunkLength);
        } else {
          mock += pieces[i];
        }
      }
      return mock.substring(0, message.length);
    }
    return message;
  }, [isReconstructible, message, pieces, droppedShreds, dataShreds, allShreds]);

  // Lagrange Interpolation Math Simulator
  const [polyDegree, setPolyDegree] = useState<'linear' | 'quadratic'>('quadratic');
  const [activePoints, setActivePoints] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: true, 3: true, 4: true
  });

  const degreeNum = polyDegree === 'linear' ? 1 : 2;
  const requiredPoints = degreeNum + 1;

  const basePoints = useMemo<GraphPoint[]>(() => {
    const xs = [80, 140, 200, 260, 320];
    return xs.map((x, idx) => {
      let y = 100;
      if (polyDegree === 'linear') {
        y = 50 + 0.3 * x;
      } else {
        y = 160 - 0.0015 * Math.pow(x - 200, 2);
      }
      return { id: idx, x, y };
    });
  }, [polyDegree]);

  const activePointsList = useMemo(() => {
    return basePoints.filter(p => activePoints[p.id]);
  }, [basePoints, activePoints]);

  const togglePoint = (id: number) => {
    setActivePoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Lagrange Interpolation Function
  const interpolate = (pts: GraphPoint[], x: number) => {
    if (pts.length === 0) return 100;
    if (pts.length === 1) return pts[0].y;
    let total = 0;
    for (let i = 0; i < pts.length; i++) {
      let term = pts[i].y;
      for (let j = 0; j < pts.length; j++) {
        if (j !== i) {
          term = term * (x - pts[j].x) / (pts[i].x - pts[j].x);
        }
      }
      total += term;
    }
    return total;
  };

  // Compute points along the curve for rendering paths
  const resolvedCurvePath = useMemo(() => {
    if (activePointsList.length < requiredPoints) return null;
    const pathCoords: string[] = [];
    for (let x = 50; x <= 350; x += 5) {
      const y = interpolate(activePointsList, x);
      pathCoords.push(`${x},${200 - y}`);
    }
    return `M ${pathCoords.join(' L ')}`;
  }, [activePointsList, requiredPoints]);

  // Render 3 random candidate curves underdetermined
  const candidateCurves = useMemo(() => {
    if (activePointsList.length >= requiredPoints) return [];
    
    const curves: string[] = [];
    const missingCount = requiredPoints - activePointsList.length;

    for (let c = 0; c < 3; c++) {
      const mockPts = [...activePointsList];
      const activeIds = activePointsList.map(p => p.id);
      let added = 0;
      for (let idx = 0; idx < 5; idx++) {
        if (!activeIds.includes(idx) && added < missingCount) {
          const randomY = 30 + Math.random() * 140;
          mockPts.push({ id: 10 + idx, x: basePoints[idx].x, y: randomY });
          added++;
        }
      }

      const pathCoords: string[] = [];
      for (let x = 50; x <= 350; x += 5) {
        const y = interpolate(mockPts, x);
        pathCoords.push(`${x},${200 - y}`);
      }
      curves.push(`M ${pathCoords.join(' L ')}`);
    }
    return curves;
  }, [activePointsList, requiredPoints, basePoints]);

  const originalCurvePath = useMemo(() => {
    const pathCoords: string[] = [];
    for (let x = 50; x <= 350; x += 5) {
      let y = 100;
      if (polyDegree === 'linear') {
        y = 50 + 0.3 * x;
      } else {
        y = 160 - 0.0015 * Math.pow(x - 200, 2);
      }
      pathCoords.push(`${x},${200 - y}`);
    }
    return `M ${pathCoords.join(' L ')}`;
  }, [polyDegree]);

  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 2: Cryptography
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Cryptographic Primitives
        </h1>
        <p className="text-lg text-muted-foreground">
          Alpenglow combines classical mathematics and advanced signatures to scale performance.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Key className="h-5 w-5 animate-pulse" /> ELI5: Cryptography in plain English
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3 font-sans">
          <p>
            Alpenglow relies on three clever mathematical tricks to keep the blockchain secure and fast:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Postcard Shuffling (Reed-Solomon):</strong> If you want to mail a 4-page letter but worry some pages will get lost, you expand it into 8 postcards. As long as the recipient gets <strong>any 4</strong> postcards, they can rebuild the full letter!
            </li>
            <li>
              <strong>The Stacked Signatures (BLS Aggregation):</strong> Instead of 1,000 validators writing their signatures on a page (which becomes massive), they stack their digital signatures on top of each other. This creates a single 96-byte signature that proves all 1,000 nodes voted, fitting inside a single postcard.
            </li>
            <li>
              <strong>Receipt Tree (Merkle Tree):</strong> Instead of checking the entire block of data to verify a single transaction, the leader creates a mathematical tree of receipts. The validator only needs the transaction and its "math path" to confirm it is valid, taking a microsecond.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Reed-Solomon Polynomial Visual Math Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Activity className="h-5 w-5 text-purple-600" /> Math Visualized: Reed-Solomon Polynomials
          </CardTitle>
          <CardDescription className="text-sm">
            See how coordinates define equations, allowing perfect recovery from partial points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-base text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              In algebra, a <strong>Linear Equation</strong> (degree 1: <code>y = mx + c</code>) requires exactly <strong>2 points</strong> to be solved. 
              A <strong>Quadratic Parabola</strong> (degree 2: <code>y = ax² + bx + c</code>) requires exactly <strong>3 points</strong>.
            </p>
            <div className="p-3 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-1.5 text-xs">
              <strong>Simple Straight-Line Arithmetic:</strong>
              <br />
              Suppose we have a secret equation: <code>y = 2x + 1</code>.
              <br />
              • If we are only given <strong>1 point</strong>, say <code>(1, 3)</code>: there are infinite lines that can go through it (e.g. <code>y = 3x</code>, <code>y = x + 2</code>). The secret is lost!
              <br />
              • If we are given <strong>2 points</strong>, say <code>(1, 3)</code> and <code>(2, 5)</code>: we solve the equations <code>3 = m(1) + c</code> and <code>5 = m(2) + c</code>. By subtraction, <code>m = 2</code>, and <code>c = 1</code>. We successfully reconstructed the exact secret formula: <code>y = 2x + 1</code>!
            </div>
            <p>
              Reed-Solomon codes exploit this: we encode data as values along a polynomial of degree <code>d</code>. 
              We evaluate this polynomial at <code>Γ</code> points (shreds). 
              As long as we collect any <code>d + 1</code> active points, we can reconstruct the exact polynomial 
              using <strong>Lagrange Interpolation</strong>. If we have fewer points, the curve becomes ambiguous.
            </p>
          </div>

          {/* Interactive Graph widget */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border text-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2 text-sm">Configure Curve Type</span>
                <div className="flex gap-2">
                  <Button
                    variant={polyDegree === 'linear' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setPolyDegree('linear'); setActivePoints({0:true,1:true,2:true,3:true,4:true}); }}
                    className="flex-1 text-xs"
                  >
                    Linear (D=1)
                  </Button>
                  <Button
                    variant={polyDegree === 'quadratic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setPolyDegree('quadratic'); setActivePoints({0:true,1:true,2:true,3:true,4:true}); }}
                    className="flex-1 text-xs"
                  >
                    Quadratic (D=2)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {polyDegree === 'linear' 
                    ? "Requires at least 2 active points to reconstruct. Drop points below 2 to see ambiguity." 
                    : "Requires at least 3 active points to reconstruct. Drop points below 3 to see ambiguity."}
                </p>
              </div>

              {/* Point Toggles */}
              <div className="space-y-2 border-t pt-3">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">Point Status (Shreds)</span>
                {basePoints.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <span className="font-mono">P{p.id + 1} ({p.x}, {p.y.toFixed(0)})</span>
                    <Button
                      variant={activePoints[p.id] ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePoint(p.id)}
                      className={`text-xs h-7 px-2 ${activePoints[p.id] ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    >
                      {activePoints[p.id] ? "ACTIVE" : "DROPPED"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinate Plot SVG */}
            <div className="md:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4 border rounded-lg">
              <svg width="100%" height="200" className="border rounded bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-visible font-sans">
                <defs>
                  <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="orange-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Grid Lines */}
                <line x1="50" y1="180" x2="350" y2="180" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="200" y1="20" x2="200" y2="180" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4,4" />

                <text x="55" y="195" className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px]">x=50</text>
                <text x="325" y="195" className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px]">x=350</text>

                {candidateCurves.map((curve, idx) => (
                  <path key={idx} d={curve} fill="none" className="stroke-slate-300 dark:stroke-slate-700 opacity-60" strokeWidth="1" strokeDasharray="4,4" />
                ))}

                {activePointsList.length < requiredPoints && (
                  <path d={originalCurvePath} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6,4" filter="url(#orange-glow)" className="opacity-80" />
                )}

                {resolvedCurvePath && (
                  <path d={resolvedCurvePath} fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#green-glow)" />
                )}

                {basePoints.map((p) => {
                  const isActive = activePoints[p.id];
                  return (
                    <g key={p.id} className="cursor-pointer" onClick={() => togglePoint(p.id)}>
                      <circle
                        cx={p.x}
                        cy={200 - p.y}
                        r="6.5"
                        className={isActive 
                          ? "fill-emerald-500 stroke-white dark:stroke-slate-950 stroke-[1.5]" 
                          : "fill-rose-500 stroke-white dark:stroke-slate-950 stroke-[1.5] opacity-40"}
                      />
                      <text
                        x={p.x + 8}
                        y={200 - p.y + 3}
                        className={`font-mono text-[9px] font-bold ${isActive ? "fill-slate-700 dark:fill-slate-300" : "fill-slate-400 dark:fill-slate-600 opacity-50"}`}
                      >
                        P{p.id + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-3 text-center text-sm font-semibold">
                {activePointsList.length >= requiredPoints ? (
                  <span className="text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> System Solvable: Interpolated original curve!
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center justify-center gap-1">
                    <XCircle className="h-4 w-4" /> Ambiguity Stalled: Infinite polynomials can fit these points.
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reed-Solomon Interactive Simulator */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Cpu className="h-5 w-5 text-indigo-500" /> Interactive Reed-Solomon (Γ, γ) Simulator
              </CardTitle>
              <CardDescription className="text-sm">
                Adjust parameters to see how block shredding and reconstruction works under crash faults.
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  In Alpenglow, a slice is encoded using Reed-Solomon. Any γ of the Γ shreds are sufficient to reconstruct the original slice payload.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border text-sm">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lesson Message (Payload):
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value.toUpperCase().replace(/[^A-Z-!]/g, ''));
                  setDroppedShreds({});
                }}
                className="w-full text-sm font-mono p-2 border rounded-md dark:bg-slate-950 dark:border-slate-800"
                placeholder="USE CAPITAL LETTERS AND DASHES"
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Data Shreds (γ): {dataShreds}</span>
                  <span className="text-muted-foreground">Minimum needed to decode</span>
                </div>
                <Slider
                  value={[dataShreds]}
                  onValueChange={(val: number[]) => {
                    setDataShreds(val[0]);
                    setDroppedShreds({});
                  }}
                  min={2}
                  max={8}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Total Shreds (Γ): {adjustedTotal}</span>
                  <span className="text-muted-foreground">Expansion Ratio: {expansionRatio}x</span>
                </div>
                <Slider
                  value={[totalShreds]}
                  onValueChange={(val: number[]) => {
                    setTotalShreds(val[0]);
                    setDroppedShreds({});
                  }}
                  min={dataShreds}
                  max={16}
                  step={1}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDroppedShreds({})}
                className="text-xs"
              >
                Reset (Restore All Shreds)
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  const newDrops: Record<number, boolean> = {};
                  const indices = Array.from({ length: adjustedTotal }, (_, i) => i);
                  const dropCount = adjustedTotal - dataShreds + 1;
                  const shuffled = [...indices].sort(() => 0.5 - Math.random());
                  for (let i = 0; i < dropCount; i++) {
                    newDrops[shuffled[i]] = true;
                  }
                  setDroppedShreds(newDrops);
                }}
                className="text-xs"
              >
                Simulate Fails (Drop Too Many)
              </Button>
            </div>
          </div>

          {/* Shred Grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold block text-slate-500">
              Generated Shreds (Click to drop/restore):
            </span>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {allShreds.map((shred) => {
                const isDropped = droppedShreds[shred.index];
                return (
                  <div
                    key={shred.index}
                    onClick={() => toggleDropShred(shred.index)}
                    className={`relative p-3 border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                      isDropped
                        ? "bg-slate-100 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-800 opacity-40 hover:opacity-60"
                        : shred.type === 'data'
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:scale-105 hover:shadow-sm"
                        : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:scale-105 hover:shadow-sm"
                    }`}
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      isDropped ? "text-slate-400" : shred.type === 'data' ? "text-blue-500" : "text-purple-500"
                    }`}>
                      {shred.type === 'data' ? `Data d${shred.index + 1}` : `Coding c${shred.index - dataShreds + 1}`}
                    </span>
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-black/20 px-1 py-0.5 rounded w-full truncate">
                      {shred.content}
                    </span>
                    {isDropped && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-xs font-bold px-1 py-0.5 shadow-sm">
                        LOST
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decoding Status */}
          <div className={`p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 border ${
            isReconstructible 
              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" 
              : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
          }`}>
            <div className="flex items-center gap-3">
              {isReconstructible ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 shrink-0" />
              )}
              <div>
                <h4 className="font-semibold text-base">
                  Decoder Status: {isReconstructible ? "Success" : "Failed"} (Collected {activeCount}/{dataShreds} pieces)
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isReconstructible
                    ? `Success! We collected >= ${dataShreds} shreds. We can reconstruct the exact message.`
                    : `We need at least ${dataShreds} shreds, but only have ${activeCount}. Reconstruction impossible.`}
                </p>
              </div>
            </div>
            <div className="w-full md:w-auto text-left font-mono text-sm bg-white dark:bg-slate-950 border p-2.5 rounded shadow-inner">
              <span className="text-xs text-slate-400 block mb-1">Reconstructed Output:</span>
              <span className={isReconstructible ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-500 font-bold"}>
                {reconstructedMessage}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merkle Tree Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-emerald-500" /> Merkle Tree Validation
          </CardTitle>
          <CardDescription className="text-sm">
            Why verify individually? Merkle roots bind shreds to a slice root without checking every shred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-base text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              A <strong>Merkle Tree</strong> commits to a list of shreds. A leader generates a block slice, encodes it, 
              creates a Merkle tree over all generated shred hashes, and signs the <strong>Merkle root</strong>.
            </p>
            <div className="p-3 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-1.5 text-xs font-mono">
              <strong>Step-by-Step Hashing Example:</strong>
              <br />
              Suppose we have 4 shreds: <code>A, B, C, D</code>.
              <br />
              1. Compute leaf hashes: <code>H_A = hash(A), H_B = hash(B), H_C = hash(C), H_D = hash(D)</code>.
              <br />
              2. Compute parent branch hashes: <code>H_AB = hash(H_A + H_B)</code> and <code>H_CD = hash(H_C + H_D)</code>.
              <br />
              3. Compute Master Root: <code>Root = hash(H_AB + H_CD)</code>.
              <br />
              <span className="font-sans">To prove <strong>B</strong> is part of the tree, the leader only sends: <code>B</code>, and the proof coordinates <code>[H_A, H_CD]</code>. The validator computes:
              <br />
              <code>h1 = hash(B)</code>
              <br />
              <code>h2 = hash(H_A + h1)</code>
              <br />
              <code>calculated_root = hash(h2 + H_CD)</code>
              <br />
              If <code>calculated_root === Root</code>, the proof is verified! The validator never has to fetch <code>C</code> or <code>D</code>.</span>
            </div>
            <p>
              When a node receives a shred, it receives the data piece <code>d_i</code> and a <strong>Merkle path (proof)</strong> <code>π_i</code>.
              It can verify the shred's authenticity against the root without fetching the other shreds!
            </p>
          </div>

          {/* Interactive Tree Diagram */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border space-y-6 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400">Interactive Merkle Proof Visualizer (Click a Leaf):</span>
            
            <div className="flex flex-col items-center space-y-8 w-full max-w-md">
              {/* Root */}
              <div className={`p-2 border rounded shadow-sm text-xs font-mono w-28 text-center transition-all ${
                selectedLeaf !== null ? "bg-purple-100 dark:bg-purple-950/30 border-purple-500" : "bg-white dark:bg-slate-950"
              }`}>
                <div className="font-bold text-xs text-purple-600">ROOT HASH</div>
                <span>h(1-4)</span>
              </div>

              {/* Level 1 Nodes */}
              <div className="flex justify-between w-full">
                <div className={`p-2 border rounded shadow-sm text-xs font-mono w-28 text-center transition-all ${
                  selectedLeaf !== null && selectedLeaf < 2 ? "bg-purple-100 dark:bg-purple-950/30 border-purple-500" : "bg-white dark:bg-slate-950"
                }`}>
                  <div className="font-bold text-xs text-purple-600">Left Branch</div>
                  <span>h(1-2)</span>
                </div>
                <div className={`p-2 border rounded shadow-sm text-xs font-mono w-28 text-center transition-all ${
                  selectedLeaf !== null && selectedLeaf >= 2 ? "bg-purple-100 dark:bg-purple-950/30 border-purple-500" : "bg-white dark:bg-slate-950"
                }`}>
                  <div className="font-bold text-xs text-purple-600">Right Branch</div>
                  <span>h(3-4)</span>
                </div>
              </div>

              {/* Leaves */}
              <div className="flex justify-between w-full">
                {[0, 1, 2, 3].map((idx) => {
                  const isSelected = selectedLeaf === idx;
                  const isSibling = selectedLeaf !== null && (selectedLeaf ^ 1) === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedLeaf(idx)}
                      className={`p-2 border rounded shadow-sm text-xs font-mono w-20 text-center cursor-pointer select-none transition-all ${
                        isSelected 
                          ? "bg-purple-500 text-white border-purple-600 scale-110" 
                          : isSibling 
                          ? "bg-amber-100 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-300"
                          : "bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className={`font-bold text-xs ${isSelected ? "text-purple-100" : "text-muted-foreground"}`}>
                        LEAF {idx + 1}
                      </div>
                      <span>h(d{idx + 1})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Path description */}
            <div className="text-sm text-center font-mono max-w-sm mt-4 min-h-12 bg-white dark:bg-slate-950 border p-3 rounded w-full">
              {selectedLeaf !== null ? (
                <div>
                  <span className="font-bold text-purple-600">Proof for Leaf {selectedLeaf + 1}: </span>
                  We only need Leaf {selectedLeaf + 1}'s hash, plus sibling{" "}
                  <span className="text-amber-600 dark:text-amber-400 font-bold">h(d{(selectedLeaf ^ 1) + 1})</span> and sibling{" "}
                  <span className="text-purple-600 font-bold">h({selectedLeaf < 2 ? "3-4" : "1-2"})</span> to compute the Root.
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">Select a Leaf to display its Merkle Proof path.</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BLS Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Key className="h-5 w-5 text-indigo-500" /> BLS Aggregate Signatures
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Fitting thousands of signatures in a single UDP packet (The Keycard Addition Analogy).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            In Solana, there are up to 1,500 validators. If 60% of them vote yes, that is 900 signatures. 
            Standard Ed25519 signatures are 64 bytes each, meaning 900 signatures would take <strong>57,600 bytes</strong>. 
            This is too large for a standard internet packet (UDP limits are ~1,500 bytes).
          </p>

          <div className="p-4 border rounded-lg bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900 space-y-2 text-sm">
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs">The Keycard Analogy</h4>
            <p>
              Imagine 900 employees want to sign off on a budget proposal. Instead of sending 900 separate physical keycards, 
              they stack their cards on top of each other. Through elliptic curve math, the points are "added" together: 
              <code>PK_aggregate = PK_1 + PK_2 + ... + PK_900</code>.
              <br />
              This produces a single, combined keycard that can unlock the budget with a single mathematical signature verification!
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950 space-y-1">
              <h4 className="text-sm font-bold text-red-600">Standard Ed25519 signatures</h4>
              <p className="text-muted-foreground">
                Signatures must be sent separately or concatenated. Size scales linearly with signers. 
                900 signatures = 57.6 KB (Cannot fit in a single UDP packet).
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 space-y-1">
              <h4 className="text-sm font-bold text-emerald-600">BLS (Boneh-Lynn-Shacham)</h4>
              <p className="text-muted-foreground">
                Signatures on the <strong>same message</strong> are compressed mathematically into a single 
                <strong> 96-byte</strong> aggregate signature, plus a 188-byte bitmap. 
                Fits easily in UDP (totaling ~384 bytes).
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 4 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Why is BLS signature aggregation absolutely necessary for Alpenglow's high-speed consensus?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) It makes transactions execute 10 times faster by parallelizing smart contracts.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) It compresses 900+ validator signatures from 57.6 KB down to just 96 bytes, letting them fit inside a single UDP network packet.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) It allows validators to hide their voting history to ensure privacy during consensus.
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
                    <strong>Correct!</strong> Standard signatures (Ed25519) are 64 bytes each, which grows to 57.6 KB for 900 validators—far exceeding the 1,500-byte UDP packet limit. BLS aggregates them into a single 96-byte point, making real-time network broadcasts possible.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Incorrect, try again!</strong> BLS focuses strictly on message/signature compression for network transport, not contract execution (A) or anonymous voting (C).
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
