
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Download } from 'lucide-react';
import { SoccerBallIcon } from '@/components/icons/soccer-ball-icon';
import type { ApplyPanelinhaRestrictionsOutput } from '@/ai/flows/apply-panelinha-restrictions';

interface GeneratedTeamsDisplayProps {
  teams: ApplyPanelinhaRestrictionsOutput | null;
  onExportText: () => void;
}

export function GeneratedTeamsDisplay({ teams, onExportText }: GeneratedTeamsDisplayProps) {
  if (!teams || teams.length === 0) {
    return (
      <Card className="bg-card/70 border-accent shadow-xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center text-card-foreground">
            <ListChecks className="mr-3 h-8 w-8 text-primary" />
            Equipes Geradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">Nenhuma equipe gerada ainda. Configure e gere novas equipes ou verifique o histórico.</p>
           <img src="https://placehold.co/300x200.png" alt="Placeholder campo de futebol" data-ai-hint="soccer field" className="mx-auto rounded-md opacity-50"/>
        </CardContent>
      </Card>
    );
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline text-foreground flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary-foreground" />
          Equipes Formadas!
        </h2>
        <Button onClick={onExportText} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Download className="mr-2 h-5 w-5" />
          Exportar (.txt)
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {teams.map((team, index) => (
          <Card key={index} className="bg-card/80 border-accent shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
            <CardHeader className={`p-4 text-white ${teamColors[index % teamColors.length]}`}>
              <CardTitle className="text-2xl flex items-center">
                <SoccerBallIcon className="mr-2 h-6 w-6" />
                Time {String.fromCharCode(65 + index)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {team.length > 0 ? (
                <ul className="space-y-2">
                  {team.map((player, playerIndex) => (
                    <li key={playerIndex} className="flex items-center text-foreground text-lg p-2 rounded bg-background">
                      <span className="text-primary font-semibold mr-3">{playerIndex + 1}.</span>
                      {player}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Time vazio.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
