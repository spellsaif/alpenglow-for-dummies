import { useState, useEffect, useRef } from 'react';
import JargonBuster from '@/components/lessons/JargonBuster';
import Overview from '@/components/lessons/Overview';
import SystemModel from '@/components/lessons/SystemModel';
import Cryptography from '@/components/lessons/Cryptography';
import DataStructures from '@/components/lessons/DataStructures';
import VotesCertificates from '@/components/lessons/VotesCertificates';
import FaultTolerance from '@/components/lessons/FaultTolerance';
import BlockCreation from '@/components/lessons/BlockCreation';
import ExecutionModels from '@/components/lessons/ExecutionModels';
import CrashResilience from '@/components/lessons/CrashResilience';
import SamplingTheory from '@/components/lessons/SamplingTheory';
import ProofsLesson from '@/components/lessons/ProofsLesson';
import AsynchronyRecovery from '@/components/lessons/AsynchronyRecovery';

import RotorSimulator from '@/components/simulators/RotorSimulator';
import VotorSimulator from '@/components/simulators/VotorSimulator';
import SamplingSimulator from '@/components/simulators/SamplingSimulator';
import TimeoutSimulator from '@/components/simulators/TimeoutSimulator';
import MegaphoneSimulator from '@/components/simulators/MegaphoneSimulator';
import Playground from '@/components/simulators/Playground';
import Reference from '@/components/lessons/Reference';

import { 
  BookOpen, 
  HelpCircle, 
  Network, 
  FileCode, 
  ShieldCheck, 
  Cpu, 
  Hammer, 
  Percent, 
  Clock, 
  Database, 
  Bookmark,
  Sun,
  Moon,
  ChevronRight,
  GitCommit,
  Flame,
  Binary,
  Volume2,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';

type PageId = 
  | 'welcome'
  | 'jargon'
  | 'overview'
  | 'systemmodel'
  | 'crypto'
  | 'datastruct'
  | 'votescerts'
  | 'fault'
  | 'blockcreate'
  | 'execution'
  | 'crashres'
  | 'samplingtheory'
  | 'proofs'
  | 'asynchrony'
  | 'rotor'
  | 'votor'
  | 'sampling'
  | 'timeout'
  | 'megaphone'
  | 'playground'
  | 'reference';

interface NavigationItem {
  id: PageId;
  label: string;
  category: 'Learn' | 'Simulate' | 'Sandbox' | 'Reference';
  icon: React.ReactNode;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('welcome');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const navigationItems: NavigationItem[] = [
    { id: 'jargon', label: '1. The Jargon Buster', category: 'Learn', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'overview', label: '2. What is Alpenglow?', category: 'Learn', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'systemmodel', label: '3. System Model', category: 'Learn', icon: <Network className="h-4 w-4" /> },
    { id: 'crypto', label: '4. Cryptography Primitives', category: 'Learn', icon: <Lock className="h-4 w-4" /> },
    { id: 'datastruct', label: '5. Data Structures', category: 'Learn', icon: <FileCode className="h-4 w-4" /> },
    { id: 'votescerts', label: '6. Votes & Certificates', category: 'Learn', icon: <GitCommit className="h-4 w-4" /> },
    { id: 'fault', label: '7. 20+20 Fault Tolerance', category: 'Learn', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'blockcreate', label: '8. Leader Logic & Repair', category: 'Learn', icon: <Hammer className="h-4 w-4" /> },
    { id: 'execution', label: '9. Execution Models', category: 'Learn', icon: <Cpu className="h-4 w-4" /> },
    { id: 'crashres', label: '10. Crash Resilience', category: 'Learn', icon: <Flame className="h-4 w-4" /> },
    { id: 'samplingtheory', label: '11. Smart Sampling Theory', category: 'Learn', icon: <Binary className="h-4 w-4" /> },
    { id: 'proofs', label: '12. Safety & Liveness Proofs', category: 'Learn', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'asynchrony', label: '13. Asynchrony & Recovery', category: 'Learn', icon: <Volume2 className="h-4 w-4" /> },
    
    { id: 'rotor', label: 'Rotor Dissemination', category: 'Simulate', icon: <Network className="h-4 w-4" /> },
    { id: 'votor', label: 'Votor Voting Engine', category: 'Simulate', icon: <Cpu className="h-4 w-4" /> },
    { id: 'sampling', label: 'PS-P Smart Sampling', category: 'Simulate', icon: <Percent className="h-4 w-4" /> },
    { id: 'timeout', label: 'Dynamic Timeouts', category: 'Simulate', icon: <Clock className="h-4 w-4" /> },
    { id: 'megaphone', label: 'Megaphone Outage Recovery', category: 'Simulate', icon: <Volume2 className="h-4 w-4" /> },
    
    { id: 'playground', label: 'Consensus Sandbox', category: 'Sandbox', icon: <Database className="h-4 w-4" /> },
    
    { id: 'reference', label: 'Parameters & Comparisons', category: 'Reference', icon: <Bookmark className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'jargon':
        return <JargonBuster />;
      case 'overview':
        return <Overview />;
      case 'systemmodel':
        return <SystemModel />;
      case 'crypto':
        return <Cryptography />;
      case 'datastruct':
        return <DataStructures />;
      case 'votescerts':
        return <VotesCertificates />;
      case 'fault':
        return <FaultTolerance />;
      case 'blockcreate':
        return <BlockCreation />;
      case 'execution':
        return <ExecutionModels />;
      case 'crashres':
        return <CrashResilience />;
      case 'samplingtheory':
        return <SamplingTheory />;
      case 'proofs':
        return <ProofsLesson />;
      case 'asynchrony':
        return <AsynchronyRecovery />;
      case 'rotor':
        return <RotorSimulator />;
      case 'votor':
        return <VotorSimulator />;
      case 'sampling':
        return <SamplingSimulator />;
      case 'timeout':
        return <TimeoutSimulator />;
      case 'megaphone':
        return <MegaphoneSimulator />;
      case 'playground':
        return <Playground />;
      case 'reference':
        return <Reference />;
      case 'welcome':
      default:
        return renderWelcome();
    }
  };

  const renderWelcome = () => (
    <div className="space-y-8 text-left max-w-3xl mx-auto py-6">
      <div className="space-y-4">
        <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20 text-xs py-1 px-3">
          Consensus Interactive Guide
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight glowing-title font-sans py-2">
          Alpenglow for Dummies
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
          Master the Solana Alpenglow consensus protocol through step-by-step interactive lessons, 
          animated simulators, and a live sandbox. Perfect for developers, researchers, and blockchain enthusiasts.
        </p>
      </div>

      {/* Grid of Key Topics */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border border-slate-200 dark:border-zinc-800 bg-transparent shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <BookOpen className="h-4 w-4 text-purple-600" /> Bite-Sized Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Break down mathematical proofs, data structures, and fault tolerance assumptions with real-world analogies 
            and straightforward explanations.
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-zinc-800 bg-transparent shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Cpu className="h-4 w-4 text-purple-600" /> Interactive Simulators
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Witness Rotor shredding, Votor voting paths, PS-P sampling partitions, and dynamic timeouts run in real-time simulations.
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setCurrentPage('jargon')} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 text-sm py-2 px-4 h-auto"
        >
          Start Module 1 <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => setCurrentPage('playground')} 
          variant="outline"
          className="font-semibold text-sm py-2 px-4 h-auto"
        >
          Jump to Sandbox
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-background text-foreground transition-colors duration-200`}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden h-9 w-9 text-slate-600 dark:text-slate-400 mr-1"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentPage('welcome')}>
            <div className="bg-primary text-white rounded-lg p-1.5 shadow-sm font-extrabold text-sm tracking-wider">
              AG
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100">
              Alpenglow for Dummies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-9 w-9 text-slate-600 dark:text-slate-400"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="w-64 bg-background h-full p-4 border-r overflow-y-auto flex flex-col space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-tight">Navigation</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              {(['Learn', 'Simulate', 'Sandbox', 'Reference'] as const).map(category => (
                <div key={category} className="space-y-1.5">
                  <span className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5">
                    {category}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {navigationItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <Button
                          key={item.id}
                          onClick={() => {
                            setCurrentPage(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className={`justify-start text-[13px] font-medium h-auto min-h-[2.25rem] py-2 px-2.5 w-full text-left whitespace-normal flex items-start leading-tight ${
                            currentPage === item.id 
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 font-semibold' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <span className="mr-2 shrink-0 mt-0.5">{item.icon}</span>
                          <span className="break-words">{item.label}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Click outside backdrop to close */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-72 border-r hidden md:block shrink-0 p-4 bg-slate-50/40 dark:bg-slate-900/10 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-6">
            {/* Category Groups */}
            {(['Learn', 'Simulate', 'Sandbox', 'Reference'] as const).map(category => (
              <div key={category} className="space-y-1.5">
                <span className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5">
                  {category}
                </span>
                <div className="flex flex-col gap-0.5">
                  {navigationItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <Button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        variant="ghost"
                        className={`justify-start text-[13px] font-medium h-auto min-h-[2.25rem] py-2 px-2.5 w-full text-left whitespace-normal flex items-start leading-tight ${
                          currentPage === item.id 
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 font-semibold' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="mr-2 shrink-0 mt-0.5">{item.icon}</span>
                        <span className="break-words">{item.label}</span>
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto px-6 py-8 md:px-12 h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            {renderContent()}

            {/* Dynamic Next Page Navigation Button */}
            {(() => {
              const currentIndex = navigationItems.findIndex(item => item.id === currentPage);
              const nextItem = currentIndex !== -1 && currentIndex < navigationItems.length - 1 
                ? navigationItems[currentIndex + 1] 
                : null;
                
              if (!nextItem) return null;
              
              return (
                <div className="mt-12 pt-6 border-t flex justify-end">
                  <Button
                    onClick={() => setCurrentPage(nextItem.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 py-2 px-4 h-auto text-sm rounded-md shadow-sm border border-purple-750 transition-colors"
                  >
                    <span>Next Lesson: {nextItem.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </Button>
                </div>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}

