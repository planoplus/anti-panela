"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { TeamGeneratorForm } from '@/components/team-generator-form';
import { GeneratedTeamsDisplay } from '@/components/generated-teams-display';
import { applyPanelinhaRestrictions, type ApplyPanelinhaRestrictionsInput, type ApplyPanelinhaRestrictionsOutput } from '@/ai/flows/apply-panelinha-restrictions';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import { INITIAL_PARTICIPANTS_LIST, MIN_PARTICIPANTS } from '@/lib/constants';

const initialPanelinhaRestrictions: string[][] = [];

const Home: NextPage = () => {
  const { toast } = useToast();

  const [participantsText, setParticipantsText] = useLocalStorage<string>('brali_participantsText', INITIAL_PARTICIPANTS_LIST);
  const [teamSplitType, setTeamSplitType] = useLocalStorage<'byTeamCount' | 'byPlayerCount'>('brali_teamSplitType', 'byTeamCount');
  const [teamCountStr, setTeamCountStr] = useLocalStorage<string>('brali_teamCountStr', '2');
  const [playersPerTeamStr, setPlayersPerTeamStr] = useLocalStorage<string>('brali_playersPerTeamStr', '5');
  const [panelinhaRestrictions, setPanelinhaRestrictions] = useLocalStorage<string[][]>('brali_panelinhaRestrictions', initialPanelinhaRestrictions);
  
  const [generatedTeams, setGeneratedTeams] = useLocalStorage<ApplyPanelinhaRestrictionsOutput | null>('brali_generatedTeams', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participantsList = useMemo(() => 
    participantsText.split('\n').map(p => p.trim()).filter(p => p !== ''), 
    [participantsText]
  );

  const participantCount = useMemo(() => participantsList.length, [participantsList]);

  const handleParticipantsChange = (text: string) => {
    setParticipantsText(text);
    setGeneratedTeams(null); // Clear old teams when participants change
  };

  const handleAddRestriction = (pair: [string, string]) => {
    if (pair[0] && pair[1] && pair[0] !== pair[1]) {
      if (!panelinhaRestrictions.some(r => (r[0] === pair[0] && r[1] === pair[1]) || (r[0] === pair[1] && r[1] === pair[0]))) {
        setPanelinhaRestrictions(prev => [...prev, pair]);
      } else {
        toast({ title: "Restrição Duplicada", description: "Essa restrição já existe.", variant: "destructive" });
      }
    } else {
      toast({ title: "Seleção Inválida", description: "Selecione dois jogadores diferentes.", variant: "destructive" });
    }
  };

  const handleRemoveRestriction = (index: number) => {
    setPanelinhaRestrictions(prev => prev.filter((_, i) => i !== index));
  };

  const isSubmitDisabled = useMemo(() => {
    if (participantCount < MIN_PARTICIPANTS) return true;
    if (teamSplitType === 'byTeamCount' && (parseInt(teamCountStr) <= 0 || isNaN(parseInt(teamCountStr)))) return true;
    if (teamSplitType === 'byPlayerCount' && (parseInt(playersPerTeamStr) <= 0 || isNaN(parseInt(playersPerTeamStr)))) return true;
    return false;
  }, [participantCount, teamSplitType, teamCountStr, playersPerTeamStr]);

  const handleGenerateTeams = async () => {
    setError(null);
    if (isSubmitDisabled) {
      toast({ title: "Configuração Inválida", description: "Verifique os dados do formulário.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const input: ApplyPanelinhaRestrictionsInput = {
      players: participantsList,
      panelinhaRestrictions: panelinhaRestrictions,
    };

    if (teamSplitType === 'byTeamCount') {
      input.teamCount = parseInt(teamCountStr);
      if (input.teamCount > participantCount) {
        toast({ title: "Erro na Configuração", description: "Número de times não pode ser maior que o número de participantes.", variant: "destructive"});
        setIsLoading(false);
        return;
      }
    } else {
      input.playersPerTeam = parseInt(playersPerTeamStr);
       if (input.playersPerTeam > participantCount) {
        toast({ title: "Erro na Configuração", description: "Número de jogadores por time não pode ser maior que o número de participantes.", variant: "destructive"});
        setIsLoading(false);
        return;
      }
    }
    
    try {
      const result = await applyPanelinhaRestrictions(input);
      setGeneratedTeams(result);
      toast({ title: "Equipes Geradas!", description: "Confira os times abaixo.", className: "bg-primary text-primary-foreground" });
    } catch (e: any) {
      console.error("Error generating teams:", e);
      setError(e.message || "Falha ao gerar equipes.");
      toast({ title: "Erro ao Gerar Equipes", description: e.message || "Tente novamente.", variant: "destructive" });
      setGeneratedTeams(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    if (window.confirm("Tem certeza que deseja limpar todas as configurações?")) {
      setParticipantsText(INITIAL_PARTICIPANTS_LIST);
      setTeamSplitType('byTeamCount');
      setTeamCountStr('2');
      setPlayersPerTeamStr('5');
      setPanelinhaRestrictions([]);
      setGeneratedTeams(null);
      setError(null);
      toast({ title: "Formulário Limpo", description: "Todas as configurações foram redefinidas." });
    }
  };
  
  const handleExportText = () => {
    if (!generatedTeams) return;

    let textOutput = "Equipes Geradas - BraLiga Anti-Panela\n\n";
    generatedTeams.forEach((team, index) => {
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
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="form-configuracao" className="w-full">
            <TeamGeneratorForm
              participantsText={participantsText}
              onParticipantsChange={handleParticipantsChange}
              participantCount={participantCount}
              teamSplitType={teamSplitType}
              onTeamSplitTypeChange={setTeamSplitType}
              teamCount={teamCountStr}
              onTeamCountChange={setTeamCountStr}
              playersPerTeam={playersPerTeamStr}
              onPlayersPerTeamChange={setPlayersPerTeamStr}
              panelinhaRestrictions={panelinhaRestrictions}
              onAddRestriction={handleAddRestriction}
              onRemoveRestriction={handleRemoveRestriction}
              allParticipants={participantsList}
              onSubmit={handleGenerateTeams}
              onClear={handleClearForm}
              isSubmitDisabled={isSubmitDisabled}
              isLoading={isLoading}
            />
          </section>
          
          <section aria-labelledby="resultados-equipes" className="w-full mt-8 lg:mt-0">
             {error && (
                <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-md mb-6">
                  <h3 className="font-bold">Erro:</h3>
                  <p>{error}</p>
                </div>
              )}
            <GeneratedTeamsDisplay 
              teams={generatedTeams}
              onExportText={handleExportText}
            />
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
