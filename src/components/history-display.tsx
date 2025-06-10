
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ShieldAlert, Trash2, ListChecks, Settings, PackageOpen, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ApplyPanelinhaRestrictionsOutput } from '@/ai/flows/apply-panelinha-restrictions';
import { SoccerBallIcon } from '@/components/icons/soccer-ball-icon';
import { Badge } from "@/components/ui/badge";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  teams: ApplyPanelinhaRestrictionsOutput;
  settings: {
    participants: string[];
    teamSplitType: 'byTeamCount' | 'byPlayerCount';
    teamCount?: number;
    playersPerTeam?: number;
    panelinhaRestrictions: string[][];
  };
}

interface HistoryDisplayProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const teamColors = [
  "bg-gradient-to-br from-red-500 to-red-700", 
  "bg-gradient-to-br from-orange-500 to-orange-700", 
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-gray-500 to-gray-700", 
  "bg-gradient-to-br from-pink-500 to-pink-700",
  "bg-gradient-to-br from-rose-500 to-rose-700",
  "bg-gradient-to-br from-amber-500 to-amber-700",
  "bg-gradient-to-br from-stone-500 to-stone-700",
];

export function HistoryDisplay({ history, onClearHistory }: HistoryDisplayProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="bg-card/70 border-accent shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center text-card-foreground">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" />
            Histórico de Sorteios
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <PackageOpen className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">Nenhum sorteio no histórico ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 border-accent shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-3xl font-headline text-foreground flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-primary" />
          Histórico de Sorteios
        </CardTitle>
        <Button onClick={onClearHistory} variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Histórico
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {history.map((entry) => (
            <AccordionItem value={entry.id} key={entry.id} className="bg-card/70 border-accent rounded-md shadow-md">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left">
                  <div className="font-medium text-lg text-foreground">
                    {format(new Date(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 md:mt-0">
                    {entry.teams.length} times sorteados ({entry.settings.participants.length} jogadores)
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/>Configurações Usadas:</h4>
                    <div className="text-sm text-muted-foreground space-y-1 ml-2">
                      <p>Divisão: {entry.settings.teamSplitType === 'byTeamCount' ? `${entry.settings.teamCount} times` : `${entry.settings.playersPerTeam} jogadores/time`}</p>
                       <p className="flex items-center"><Users2 className="mr-2 h-4 w-4 text-primary/80"/>Participantes ({entry.settings.participants.length}): <span className="ml-1 truncate text-ellipsis max-w-[200px] md:max-w-xs" title={entry.settings.participants.join(', ')}>{entry.settings.participants.join(', ')}</span></p>
                      {entry.settings.panelinhaRestrictions.length > 0 && (
                        <div>
                          <p className="flex items-center"><ShieldAlert className="mr-2 h-4 w-4 text-primary/80"/>Restrições de Panelinha:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.settings.panelinhaRestrictions.map((pair, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{pair[0]} ≠ {pair[1]}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Equipes:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {entry.teams.map((team, teamIndex) => (
                        <Card key={teamIndex} className="bg-card/50 border-accent shadow-sm overflow-hidden">
                          <CardHeader className={`p-3 text-white ${teamColors[teamIndex % teamColors.length]}`}>
                            <CardTitle className="text-xl flex items-center">
                              <SoccerBallIcon className="mr-2 h-5 w-5" />
                              Time {String.fromCharCode(65 + teamIndex)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3">
                            {team.length > 0 ? (
                              <ul className="space-y-1">
                                {team.map((player, playerIdx) => (
                                  <li key={playerIdx} className="flex items-center text-foreground text-sm p-1.5 rounded bg-background">
                                    <span className="text-primary font-semibold mr-2">{playerIdx + 1}.</span>
                                    {player}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground text-sm">Time vazio.</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
