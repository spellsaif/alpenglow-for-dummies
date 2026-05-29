import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Award, Compass, Layers } from 'lucide-react';

export default function Reference() {
  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 11: Reference
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Comparisons, Innovations, and Parameters
        </h1>
        <p className="text-lg text-muted-foreground">
          Deep-dive parameters, related academic work comparisons, and bandwidth math.
        </p>
      </div>

      {/* Related Work Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Compass className="h-5 w-5 text-indigo-500" /> Related Work Comparison
          </CardTitle>
          <CardDescription className="text-sm">
            How Alpenglow stacks up against alternative consensus designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] text-sm">Protocol / Class</TableHead>
                  <TableHead className="text-sm">Bandwidth model</TableHead>
                  <TableHead className="text-sm">Finalization Latency</TableHead>
                  <TableHead className="text-sm">Fault Assumptions</TableHead>
                  <TableHead className="text-sm">Key Distinction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Classic BFT (PBFT, HotStuff)</TableCell>
                  <TableCell>Leader Bottleneck</TableCell>
                  <TableCell>Low (2 rounds)</TableCell>
                  <TableCell>Byzantine &lt; 33.3%</TableCell>
                  <TableCell>Simple, but leader handles all transmission overhead.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">DAG-based (Mysticeti, Narwhal)</TableCell>
                  <TableCell>All nodes contribute</TableCell>
                  <TableCell>High (3-5&delta;)</TableCell>
                  <TableCell>Byzantine &lt; 33.3%</TableCell>
                  <TableCell>High throughput, but latency increases due to vertex sequencing delay.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">Banyan</TableCell>
                  <TableCell>Erasure coded</TableCell>
                  <TableCell>min(1, 2) rounds</TableCell>
                  <TableCell>Byzantine &lt; 33.3%</TableCell>
                  <TableCell>Uses parallel fast/slow tracks, but lacks leader windows.</TableCell>
                </TableRow>
                <TableRow className="bg-purple-50/20 dark:bg-purple-950/10">
                  <TableCell className="font-bold text-purple-600 dark:text-purple-400">
                    Alpenglow
                  </TableCell>
                  <TableCell className="text-purple-700 dark:text-purple-300">Relayed Erasure Coding</TableCell>
                  <TableCell className="text-purple-700 dark:text-purple-300 font-semibold">min(&delta;_80%, 2·&delta;_60%)</TableCell>
                  <TableCell className="text-purple-700 dark:text-purple-300">Byzantine &lt; 20% + Crash &le; 20%</TableCell>
                  <TableCell className="text-purple-700 dark:text-purple-300">Asymptotically optimal bandwidth; fast handoff between leaders.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Layers className="h-5 w-5 text-emerald-500" /> Protocol Parameter Values
          </CardTitle>
          <CardDescription className="text-sm">Official specifications defined in the consensus system model.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 text-center">
              <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Leader Window (w)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">4 slots</span>
            </div>
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 text-center">
              <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Shreds per Slice (&Gamma; / &gamma;)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">64 / 32</span>
            </div>
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 text-center">
              <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Base Block Time (&Delta;_block)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">400 ms</span>
            </div>
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900 text-center">
              <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Standstill limit (&Delta;_standstill)</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">10 seconds</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Innovations Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xl font-bold">
            <Award className="h-5 w-5" /> Summary of Key Innovations
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            The core breakthroughs introduced in Solana Alpenglow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">Dual-path Finalization</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                <p>
                  Instead of choosing between a fast 1-step protocol or a slow, crash-resilient 2-step protocol, Alpenglow 
                  runs both finalization paths in parallel!
                </p>
                <p>
                  Whichever path completes first on the node's local machine is used to finalize the block:
                  <code> min( &delta;_80%, 2·&delta;_60% )</code>.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">Leader Windows & Fast Handoff</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                By assigning multiple consecutive slots (e.g. 4) to the same leader, the leader can stream block slices 
                without waiting for the previous slot to be finalized. The next slot's leader starts building immediately 
                upon receiving the last slice of the current block, creating a seamless handoff chain.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">Dynamic Timeouts</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                During deep network outages or prolonged standstill (exceeding 10 seconds), nodes increase their timeouts 
                exponentially by 5% per window. Because this is done locally and independently on each node, it guarantees 
                safety and recovers liveness once synchrony is restored, with zero coordination overhead.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
