
"use client";

import type { NextPage } from 'next';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { GeneratedTeamsDisplay } from '@/components/generated-teams-display';
import { HistoryDisplay, type HistoryEntry } from '@/components/history-display';
import { TeamGeneratorForm } from '@/components/team-generator-form';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import { applyPanelinhaRestrictions, type ApplyPanelinhaRestrictionsInput, type ApplyPanelinhaRestrictionsOutput } from '@/ai/flows/apply-panelinha-restrictions';
import { INITIAL_PARTICIPANTS_LIST, MIN_PARTICIPANTS, MAX_HISTORY_ITEMS } from '@/lib/constants';

const initialPanelinhaRestrictions: string[][] = [];

const Home: NextPage = () => {
  const { toast } = useToast();
  
  const [participantsText, setParticipantsText] = useLocalStorage<string>('brali_participants', INITIAL_PARTICIPANTS_LIST);
  const [teamSplitType, setTeamSplitType] = useLocalStorage<'byTeamCount' | 'byPlayerCount'>('brali_teamSplitType', 'byTeamCount');
  const [teamCount, setTeamCount] = useLocalStorage<string>('brali_teamCount', '2');
  const [playersPerTeam, setPlayersPerTeam] = useLocalStorage<string>('brali_playersPerTeam', '5');
  const [panelinhaRestrictions, setPanelinhaRestrictions] = useLocalStorage<string[][]>('brali_panelinhaRestrictions', initialPanelinhaRestrictions);
  
  const [isLoading, setIsLoading] = useState(false);
  const [drawHistory, setDrawHistory] = useLocalStorage<HistoryEntry[]>('brali_drawHistory', []);
  const [currentlyDisplayedTeams, setCurrentlyDisplayedTeams] = useState<ApplyPanelinhaRestrictionsOutput | null>(null);

  useEffect(() => {
    // Initialize currentlyDisplayedTeams from history if available and no teams are currently set (e.g. after a refresh)
    if (drawHistory.length > 0 && !currentlyDisplayedTeams) {
      setCurrentlyDisplayedTeams(drawHistory[0].teams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawHistory]); // Only run when drawHistory changes


  const allParticipants = useMemo(() => {
    return participantsText.split('\n').map(p => p.trim()).filter(p => p);
  }, [participantsText]);

  const participantCount = useMemo(() => allParticipants.length, [allParticipants]);

  const handleParticipantsChange = useCallback((text: string) => {
    setParticipantsText(text);
  }, [setParticipantsText]);

  const handleTeamSplitTypeChange = useCallback((type: 'byTeamCount' | 'byPlayerCount') => {
    setTeamSplitType(type);
  }, [setTeamSplitType]);

  const handleTeamCountChange = useCallback((count: string) => {
    setTeamCount(count);
  }, [setTeamCount]);

  const handlePlayersPerTeamChange = useCallback((count: string) => {
    setPlayersPerTeam(count);
  }, [setPlayersPerTeam]);

  const handleAddRestriction = useCallback((pair: [string, string]) => {
    if (pair[0] && pair[1] && pair[0] !== pair[1]) {
      if (!panelinhaRestrictions.some(r => (r[0] === pair[0] && r[1] === pair[1]) || (r[0] === pair[1] && r[1] === pair[0]))) {
        setPanelinhaRestrictions(prev => [...prev, pair]);
      } else {
        toast({ title: "Restrição Duplicada", description: "Esta restrição já existe.", variant: "destructive" });
      }
    } else {
        toast({ title: "Seleção Inválida", description: "Selecione dois jogadores diferentes para a restrição.", variant: "destructive" });
    }
  }, [panelinhaRestrictions, setPanelinhaRestrictions, toast]);

  const handleRemoveRestriction = useCallback((index: number) => {
    setPanelinhaRestrictions(prev => prev.filter((_, i) => i !== index));
  }, [setPanelinhaRestrictions]);

  const handleClearForm = useCallback(() => {
    setParticipantsText(INITIAL_PARTICIPANTS_LIST);
    setTeamSplitType('byTeamCount');
    setTeamCount('2');
    setPlayersPerTeam('5');
    setPanelinhaRestrictions(initialPanelinhaRestrictions);
    setCurrentlyDisplayedTeams(null);
    toast({ title: "Formulário Limpo", description: "Os campos foram redefinidos e a exibição de times foi limpa." });
  }, [setParticipantsText, setTeamSplitType, setTeamCount, setPlayersPerTeam, setPanelinhaRestrictions, setCurrentlyDisplayedTeams, toast]);
  
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    if (participantCount < MIN_PARTICIPANTS) {
      toast({ title: "Erro", description: `São necessários pelo menos ${MIN_PARTICIPANTS} participantes.`, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const numTeamCount = parseInt(teamCount, 10);
    const numPlayersPerTeam = parseInt(playersPerTeam, 10);

    let input: ApplyPanelinhaRestrictionsInput;

    if (teamSplitType === 'byTeamCount') {
      if (isNaN(numTeamCount) || numTeamCount <= 0) {
        toast({ title: "Erro", description: "A quantidade de times deve ser um número positivo.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (numTeamCount > participantCount) {
        toast({ title: "Erro", description: "A quantidade de times não pode ser maior que o número de participantes.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      input = { players: allParticipants, teamCount: numTeamCount, panelinhaRestrictions };
    } else {
      if (isNaN(numPlayersPerTeam) || numPlayersPerTeam <= 0) {
        toast({ title: "Erro", description: "A quantidade de jogadores por time deve ser um número positivo.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
       if (numPlayersPerTeam > participantCount) {
        toast({ title: "Erro", description: "Jogadores por time não pode ser maior que o número de participantes.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      input = { players: allParticipants, playersPerTeam: numPlayersPerTeam, panelinhaRestrictions };
    }

    try {
      const generatedTeams = await applyPanelinhaRestrictions(input);
      setCurrentlyDisplayedTeams(generatedTeams);
      
      const newHistoryEntry: HistoryEntry = {
        id: new Date().toISOString() + Math.random().toString(36).substring(2,9), 
        timestamp: Date.now(),
        teams: generatedTeams,
        settings: {
          participants: allParticipants,
          teamSplitType,
          teamCount: teamSplitType === 'byTeamCount' ? numTeamCount : undefined,
          playersPerTeam: teamSplitType === 'byPlayerCount' ? numPlayersPerTeam : undefined,
          panelinhaRestrictions,
        },
      };

      setDrawHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, MAX_HISTORY_ITEMS - 1)]);
      toast({ title: "Sucesso!", description: "Equipes geradas e adicionadas ao histórico." });

    } catch (error: any) {
      console.error("Error generating teams:", error);
      toast({ title: "Erro ao Gerar Times", description: error.message || "Ocorreu um problema.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [
    participantCount, 
    allParticipants, 
    teamSplitType, 
    teamCount, 
    playersPerTeam, 
    panelinhaRestrictions, 
    setDrawHistory,
    setCurrentlyDisplayedTeams, 
    toast
  ]);

  const isSubmitDisabled = useMemo(() => {
    if (isLoading) return true;
    if (participantCount < MIN_PARTICIPANTS) return true;
    if (teamSplitType === 'byTeamCount') {
      const tc = parseInt(teamCount, 10);
      if (isNaN(tc) || tc <= 0 || tc > participantCount) return true;
    } else {
      const ppt = parseInt(playersPerTeam, 10);
      if (isNaN(ppt) || ppt <= 0 || ppt > participantCount) return true;
    }
    return false;
  }, [isLoading, participantCount, teamSplitType, teamCount, playersPerTeam]);

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico de sorteios? Esta ação não pode ser desfeita.")) {
      setDrawHistory([]);
      setCurrentlyDisplayedTeams(null); 
      toast({ title: "Histórico Limpo", description: "O histórico de sorteios foi apagado." });
    }
  };
  
  const handleExportText = () => {
    if (!currentlyDisplayedTeams) {
      toast({ title: "Nada para Exportar", description: "Não há equipes geradas para exportar.", variant: "destructive" });
      return;
    }

    let textOutput = "Equipes Geradas - BraLiga Anti-Panela\n\n";
    currentlyDisplayedTeams.forEach((team, index) => {
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

  const handleClearDisplayedTeams = () => {
    setCurrentlyDisplayedTeams(null);
    toast({ title: "Visualização Limpa", description: "As equipes exibidas foram removidas da tela." });
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <section aria-labelledby="configurar-sorteio" className="lg:col-span-1 space-y-6">
            <TeamGeneratorForm
              participantsText={participantsText}
              onParticipantsChange={handleParticipantsChange}
              participantCount={participantCount}
              teamSplitType={teamSplitType}
              onTeamSplitTypeChange={handleTeamSplitTypeChange}
              teamCount={teamCount}
              onTeamCountChange={handleTeamCountChange}
              playersPerTeam={playersPerTeam}
              onPlayersPerTeamChange={handlePlayersPerTeamChange}
              panelinhaRestrictions={panelinhaRestrictions}
              onAddRestriction={handleAddRestriction}
              onRemoveRestriction={handleRemoveRestriction}
              allParticipants={allParticipants}
              onSubmit={handleSubmit}
              onClear={handleClearForm}
              isSubmitDisabled={isSubmitDisabled}
              isLoading={isLoading}
            />
          </section>
          
          <div className="lg:col-span-2 space-y-12">
            <section aria-labelledby="resultados-equipes" className="w-full">
              <GeneratedTeamsDisplay 
                teams={currentlyDisplayedTeams}
                onExportText={handleExportText}
                onClearDisplayedTeams={handleClearDisplayedTeams}
              />
            </section>
            
            <section aria-labelledby="historico-sorteios" className="w-full">
              <HistoryDisplay history={drawHistory} onClearHistory={handleClearHistory} />
            </section>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-white/70 bg-black/10">
        BraLiga Anti-Panela &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Home;
