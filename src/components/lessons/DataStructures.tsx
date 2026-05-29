import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Network, FileCode2, Layers, Info, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataStructures() {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col space-y-2">
        <Badge variant="outline" className="w-fit text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-sm py-1 px-3">
          Module 3: Data Structures
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Shred, Slice, and Block Hierarchy
        </h1>
        <p className="text-lg text-muted-foreground">
          Understanding the data containers and the Double-Merkle tree architecture of Alpenglow.
        </p>
      </div>

      {/* ELI5 Header Section */}
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 animate-pulse" /> ELI5: Shreds, Slices, and Blocks
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3 font-sans">
          <p>
            Think of ledger storage as organizing a large binder of paper documents:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>A Shred (The Page):</strong> A single printed page. It's light, easy to mail in an envelope, but by itself it's just a fragment.
            </li>
            <li>
              <strong>A Slice (The Chapter):</strong> A collection of related pages stapled together. You can verify you have the whole chapter by looking at the index sheet on the front (Merkle Root).
            </li>
            <li>
              <strong>A Block (The Binder):</strong> The entire binder containing all the chapters for that month. The block hash is the barcode printed on the spine of the binder, which locks all the chapters inside.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contract Binder Analogy Card */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" /> The "Contract Binder" Analogy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Think of the blockchain ledger like a library of <strong>Contract Binders (Blocks)</strong>. 
            A single binder contains the full records for one week (Slot).
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>The Binder (Block):</strong> The full set of contracts. It contains a cover sheet linking it to the 
              previous binder's ID (Parent Block Hash).
            </li>
            <li>
              <strong>Sections (Slices):</strong> The binder is divided into chapters or sections (e.g. Chapter 1: Financial, 
              Chapter 2: Real Estate). Each section is a self-contained document (Slice).
            </li>
            <li>
              <strong>Index Cards (Shreds):</strong> Since the leader can't mail the whole binder at once over the internet, 
              each section is copied onto individual index cards (Shreds). To protect against cards getting lost in the mail, 
              the leader writes extra math index cards (Coding Shreds) containing summaries of the other cards.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Structural Hierarchy Diagram */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <span className="text-sm font-semibold text-slate-400 font-mono">Hierarchy Breakdown</span>
            
            {/* Visual Tree */}
            <div className="flex flex-col items-center space-y-4 w-full">
              {/* Block level */}
              <div className="bg-indigo-600 text-white rounded-lg p-3 w-80 text-center shadow font-bold text-sm">
                Block <span className="font-mono font-normal">b</span> (Slot <span className="font-mono font-normal">s</span>)
                <div className="text-xs text-indigo-200 mt-1 font-normal font-mono">hash(b) = Root(r_1, r_2, ..., r_k)</div>
              </div>
              
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

              {/* Slices level */}
              <div className="flex justify-between gap-4 w-full max-w-lg">
                <div className="border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg p-2.5 flex-1 text-center text-xs font-semibold">
                  Slice 1
                  <div className="font-mono text-xs text-slate-400 mt-1">Payload M₁</div>
                </div>
                <div className="border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg p-2.5 flex-1 text-center text-xs font-semibold">
                  Slice 2
                  <div className="font-mono text-xs text-slate-400 mt-1">Payload M₂</div>
                </div>
                <div className="border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg p-2.5 flex-1 text-center text-xs font-semibold border-dashed">
                  Slice K (Last)
                  <div className="font-mono text-xs text-slate-400 mt-1">z_k = 1</div>
                </div>
              </div>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

              {/* Shreds level */}
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-3.5 w-full max-w-md text-center space-y-3">
                <div className="text-sm font-bold">Each Slice encodes to Γ Shreds</div>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-mono">Shred 1</Badge>
                  <Badge variant="secondary" className="text-xs font-mono">Shred 2</Badge>
                  <Badge variant="secondary" className="text-xs font-mono">Shred Γ</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Fits in 1 UDP packet (&le; 1,500 bytes)
                </div>
                
                <div className="p-3 bg-purple-50/20 dark:bg-purple-950/10 border rounded text-left text-xs leading-relaxed space-y-1.5 font-mono">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block font-sans">Reed-Solomon Erasure Coding Example:</span>
                  We want to send two secret numbers: <code>3</code> and <code>5</code>.
                  <br />
                  1. Define a line equation: <code>y = mx + c</code> where <code>(1, 3)</code> and <code>(2, 5)</code> are our data points.
                  <br />
                  2. Solving this gives the line formula: <code>y = 2x + 1</code>.
                  <br />
                  3. We generate 2 extra parity values by evaluating at <code>x=3</code> (value is 7) and <code>x=4</code> (value is 9).
                  <br />
                  4. We send all 4 points: <code>(1,3), (2,5), (3,7), (4,9)</code>.
                  <br />
                  <span className="font-sans text-xs text-muted-foreground block">
                    If any 2 points are lost in transit (e.g. we only get <code>(1,3)</code> and <code>(4,9)</code>), we can easily reconstruct the line <code>y = 2x + 1</code> and read the values at <code>x=1</code> (3) and <code>x=2</code> (5). This is how Alpenglow tolerates up to 50% packet drops!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Level Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" /> Header Fields Deep-Dive
          </CardTitle>
          <CardDescription className="text-sm">What is inside each packet and why does it matter?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Alpenglow is designed for streaming. Because we verify integrity at packet boundaries, 
            each Shred header contains metadata that prevents attackers from sending truncated or forged data.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-900 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Last-Slice Flag (<code>z_t</code>)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A single bit flag (0 or 1). If 1, it tells the validator that this is the final slice of the block. 
                This prevents malicious leaders from truncating a block early to make validators vote on incomplete state.
              </p>
            </div>
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-900 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Slice Root (<code>r_t</code>)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Merkle root of the slice. By embedding this in the shred, any validator who collects the first shred 
                can verify all subsequent shreds against <code>r_t</code> without doing signature verification again.
              </p>
            </div>
            <div className="p-3 border rounded bg-slate-50 dark:bg-slate-900 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Leader Signature (<code>σ_t</code>)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The signature on the slice metadata: <code>Slice(s, t, z_t, r_t)</code>. It guarantees that the shred 
                was indeed produced by the designated slot leader, preventing relay spoofing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Breakdown Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Shred Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Network className="h-4 w-4 text-blue-500" /> Definition 1: Shred
            </CardTitle>
            <CardDescription className="text-sm font-mono">Shred = (s, t, i, z_t, r_t, (d_i, π_i), σ_t)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm flex-1 space-y-3">
            <p className="text-muted-foreground">
              Smallest unit of block data. Fits entirely in a single UDP datagram (&le; 1,500 bytes).
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded font-mono text-xs space-y-1 border">
              <div><code>s</code>: Slot number</div>
              <div><code>t</code>: Slice index</div>
              <div><code>i</code>: Shred index</div>
              <div><code>z_t</code>: Last-slice flag (0/1)</div>
              <div><code>r_t</code>: Slice Merkle root</div>
              <div><code>d_i, π_i</code>: Parity piece & path</div>
              <div><code>σ_t</code>: Leader signature</div>
            </div>
          </CardContent>
        </Card>

        {/* Slice Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-500" /> Definition 2: Slice
            </CardTitle>
            <CardDescription className="text-sm font-mono">Slice = (s, t, z_t, r_t, M_t, σ_t)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm flex-1 space-y-3">
            <p className="text-muted-foreground">
              Input and output units for Rotor dissemination. Reconstructed from any <code>γ</code> of the <code>Γ</code> shreds.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded font-mono text-xs space-y-1 border">
              <div><code>s</code>: Slot number</div>
              <div><code>t</code>: Slice index</div>
              <div><code>z_t</code>: Last-slice flag</div>
              <div><code>r_t</code>: Merkle root of slice</div>
              <div><code>M_t</code>: Decoded payload</div>
              <div><code>σ_t</code>: Leader signature</div>
            </div>
          </CardContent>
        </Card>

        {/* Block Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <FileCode2 className="h-4 w-4 text-purple-500" /> Definition 3: Block
            </CardTitle>
            <CardDescription className="text-sm font-mono">Block b = {'{'} Slice_t {'}'} for t=1..k</CardDescription>
          </CardHeader>
          <CardContent className="text-sm flex-1 space-y-3">
            <p className="text-muted-foreground">
              A sequence of all slices for a slot. Contains parent hashes and parent slot number, 
              defining the blockchain link structure.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded font-mono text-xs space-y-1 border">
              <div><code>b</code>: List of slices</div>
              <div><code>z_k = 1</code> on final slice</div>
              <div><code>M = M₁ || M₂ || ... || M_K</code></div>
              <div>Binds to <code>parent(b)</code> details</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Double Merkle Root Math Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Double-Merkle Block Hash Math & Example (Definition 4)</CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Step-by-step math showing how a block hash commits to multiple slice roots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-base text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Suppose a block has <code>k = 3</code> slices. Let the calculated inner Merkle roots of these slices be 
              <code> r_1, r_2, r_3</code>. How do we compute <code>hash(b)</code>?
            </p>
            
            {/* Steps list */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border text-sm space-y-3 leading-relaxed">
              <div>
                <strong>Step 1: Pad Leaves to Smallest Power of 2</strong>
                <p className="text-muted-foreground mt-0.5">
                  Since <code>k = 3</code>, the next power of 2 is 4. We pad the list with an empty leaf 
                  <code> &perp; </code> (represented as null/zero in hash computation).
                  <br />
                  Our leaves are: <code>[r_1, r_2, r_3, &perp;]</code>.
                </p>
              </div>
              <div>
                <strong>Step 2: Hash Adjacent Leaves (Level 1)</strong>
                <p className="text-muted-foreground mt-0.5">
                  We pair and hash leaves together:
                  <br />
                  <code>h_left = hash(r_1 || r_2)</code>
                  <br />
                  <code>h_right = hash(r_3 || &perp;)</code>
                </p>
              </div>
              <div>
                <strong>Step 3: Hash to Root (Level 2)</strong>
                <p className="text-muted-foreground mt-0.5">
                  We hash the level 1 hashes together to find the root:
                  <br />
                  <code>hash(b) = hash(h_left || h_right)</code>.
                </p>
              </div>
            </div>

            <p>
              This double-Merkle construction ensures that a block hash commits securely to every slice root, 
              which in turn commits to every shred.
            </p>
          </div>

          <Separator />

          {/* Mathematical Form */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border text-center font-mono text-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase">Block Hash Formula</span>
            <div className="text-slate-800 dark:text-slate-200">
              <code>hash(b) = Root( MerkleTree(r_1, r_2, ..., r_k, &perp;, ..., &perp;) )</code>
            </div>
            <div className="text-xs text-muted-foreground font-sans">
              where <code>r_t = MerkleRoot(shreds of slice t)</code> and <code>&perp;</code> is an empty leaf.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blokstor Rules Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Info className="h-5 w-5 text-purple-600" /> Blokstor: Block Storage Rules & Events (Section 9)
          </CardTitle>
          <CardDescription className="text-sm">
            How validators validate and save incoming shreds/slices in storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <p>
            When individual shreds arrive via the Rotor network, they are collected in <strong>Blokstor</strong>. 
            Before writing a shred to disk, Blokstor verifies three strict rules (Definition 10):
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Uniqueness:</strong> No shred with the exact indices <code>(s, t, i)</code> (slot <code>s</code>, slice <code>t</code>, shred <code>i</code>) is already stored. This prevents duplicate storage.
            </li>
            <li>
              <strong>Merkle Validity:</strong> The parity piece and path <code>(d_i, π_i)</code> must be valid for the slice's Merkle root <code>r_t</code>.
            </li>
            <li>
              <strong>Leader Signature:</strong> The signature <code>σ_t</code> must be a valid cryptographic signature of the slice <code>Slice(s, t, z_t, r_t)</code> by the leader scheduled for slot <code>s</code>.
            </li>
          </ol>
          <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 rounded-lg space-y-2 mt-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-sans">The Block Completed Event</span>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              As shreds arrive, Blokstor reconstructs the parent slices. When the <strong>first complete block <code>b</code></strong> for slot <code>s</code> is fully reconstructed (all slices obtained), Blokstor emits a single event:
              <br />
              <code className="block text-center font-mono my-2 text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-black/30 p-2 rounded">
                Block(slot(b), hash(b), hash(parent(b)))
              </code>
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
          <CardDescription className="text-sm">Test your dummy-level mastery of Module 5 before moving on!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            What is the structural relationship between Shreds, Slices, and Blocks in Alpenglow?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={quizAnswer === 0 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 0 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(0)}
            >
              A) A Block is a sequence of Slices, where each Slice is divided into individual Shreds so they can fit inside standard UDP network packets.
            </Button>
            <Button
              variant={quizAnswer === 1 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 1 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(1)}
            >
              B) Shreds are zipped together directly to form a Block, bypassing the need for Slices entirely.
            </Button>
            <Button
              variant={quizAnswer === 2 ? "default" : "outline"}
              className={`justify-start text-sm py-5 px-4 h-auto text-left leading-relaxed ${
                quizAnswer === 2 ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
              onClick={() => setQuizAnswer(2)}
            >
              C) A single Shred contains multiple Blocks, which are then grouped into Slices to be sent to validators.
            </Button>
          </div>

          {quizAnswer !== null && (
            <div className={`p-4 border rounded-lg flex gap-3 items-start animate-fade-in ${
              quizAnswer === 0 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-800 dark:text-rose-300"
            }`}>
              {quizAnswer === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Correct!</strong> A Block represents all data for a slot. To transmit it, it is sliced into smaller pieces (Slices). Each Slice is then expanded (using erasure codes) and divided into individual packets (Shreds) to avoid network fragmentation.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-sm font-sans font-normal">
                    <strong>Incorrect, try again!</strong> Slices are the primary unit of coding and transmission (so B is wrong), and they are larger than Shreds, not the other way around (C is wrong).
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
