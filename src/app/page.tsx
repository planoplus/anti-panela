"use client";

import type { NextPage } from 'next';
import React, { useMemo } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { GeneratedTeamsDisplay } from '@/components/generated-teams-display';
import { HistoryDisplay, type HistoryEntry } from '@/components/history-display';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import { MAX_HISTORY_ITEMS } from '@/lib/constants';
// ApplyPanelinhaRestrictionsOutput is used by HistoryEntry and GeneratedTeamsDisplay
import type { ApplyPanelinhaRestrictionsOutput } from '@/ai/flows/apply-panelinha-restrictions';


const Home: NextPage = () => {
  const { toast } = useToast();
  
  const [drawHistory, setDrawHistory] = useLocalStorage<HistoryEntry[]>('brali_drawHistory', []);
  
  const latestTeams = useMemo<ApplyPanelinhaRestrictionsOutput | null>(() => {
    if (drawHistory.length > 0) {
      return drawHistory[0].teams;
    }
    return null;
  }, [drawHistory]);

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico de sorteios? Esta ação não pode ser desfeita.")) {
      setDrawHistory([]);
      toast({ title: "Histórico Limpo", description: "O histórico de sorteios foi apagado." });
    }
  };
  
  const handleExportText = () => {
    if (!latestTeams) {
      toast({ title: "Nada para Exportar", description: "Não há equipes geradas para exportar.", variant: "destructive" });
      return;
    }

    let textOutput = "Equipes Geradas - BraLiga Anti-Panela\n\n";
    latestTeams.forEach((team, index) => {
      textOutput += `Time ${String.fromCharCode(65 + index)}:\n`;
      team.forEach((player, playerIndex) => {
        textOutput += `${playerIndex + 1}. ${player}\n`;
      });
      textOutput += "\n";
    });

    const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'brali_equipes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportado!", description: "As equipes foram salvas como arquivo de texto." });
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="space-y-12">
          <section aria-labelledby="resultados-equipes" className="w-full">
            <GeneratedTeamsDisplay 
              teams={latestTeams}
              onExportText={handleExportText}
            />
          </section>
          
          <section aria-labelledby="historico-sorteios" className="w-full">
            <HistoryDisplay history={drawHistory} onClearHistory={handleClearHistory} />
          </section>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-white/70 bg-black/10">
        BraLiga Anti-Panela &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Home;
