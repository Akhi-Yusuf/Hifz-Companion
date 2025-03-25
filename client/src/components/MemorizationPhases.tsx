import React from 'react';
import { useMemorization } from '../context/MemorizationContext';
import { MemorizationPhase } from '../types';
import { cn } from '@/lib/utils';

interface PhaseCardProps {
  phase: MemorizationPhase;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

function PhaseCard({ phase, title, isActive, onClick }: PhaseCardProps) {
  return (
    <button 
      className={cn(
        "phase-card p-3 border rounded-md text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-700",
        isActive && "border-primary dark:border-primary shadow-[0_0_0_2px_rgba(30,136,229,0.3)]"
      )}
      onClick={onClick}
    >
      <div className="text-2xl mb-2 text-primary">{phase}</div>
      <div className="text-sm">{title}</div>
    </button>
  );
}

export function MemorizationPhases() {
  const { currentPhase, setPhase } = useMemorization();

  const phases = [
    { phase: MemorizationPhase.TextWithAudio, title: "Text with Audio" },
    { phase: MemorizationPhase.TextWithoutAudio, title: "Text without Audio" },
    { phase: MemorizationPhase.TextWithHoles, title: "Text with Holes" },
    { phase: MemorizationPhase.EmptyWithAudio, title: "Empty with Audio" },
    { phase: MemorizationPhase.CompleteMemorization, title: "Complete Memorization" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Memorization Phases</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {phases.map((phaseInfo) => (
          <PhaseCard 
            key={phaseInfo.phase}
            phase={phaseInfo.phase}
            title={phaseInfo.title}
            isActive={currentPhase === phaseInfo.phase}
            onClick={() => setPhase(phaseInfo.phase)}
          />
        ))}
      </div>
    </div>
  );
}
