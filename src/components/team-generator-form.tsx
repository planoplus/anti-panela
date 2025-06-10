
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings2, ShieldAlert, Plus, X, Trash2, Loader2 } from 'lucide-react';
import { SoccerBallIcon } from '@/components/icons/soccer-ball-icon';
import { MIN_PARTICIPANTS } from '@/lib/constants';

interface TeamGeneratorFormProps {
  participantsText: string;
  onParticipantsChange: (text: string) => void;
  participantCount: number;
  teamSplitType: 'byTeamCount' | 'byPlayerCount';
  onTeamSplitTypeChange: (type: 'byTeamCount' | 'byPlayerCount') => void;
  teamCount: string;
  onTeamCountChange: (count: string) => void;
  playersPerTeam: string;
  onPlayersPerTeamChange: (count: string) => void;
  panelinhaRestrictions: string[][];
  onAddRestriction: (pair: [string, string]) => void;
  onRemoveRestriction: (index: number) => void;
  allParticipants: string[];
  onSubmit: () => void;
  onClear: () => void;
  isSubmitDisabled: boolean;
  isLoading: boolean;
}

export function TeamGeneratorForm({
  participantsText,
  onParticipantsChange,
  participantCount,
  teamSplitType,
  onTeamSplitTypeChange,
  teamCount,
  onTeamCountChange,
  playersPerTeam,
  onPlayersPerTeamChange,
  panelinhaRestrictions,
  onAddRestriction,
  onRemoveRestriction,
  allParticipants,
  onSubmit,
  onClear,
  isSubmitDisabled,
  isLoading,
}: TeamGeneratorFormProps) {
  const [restrictionPlayer1, setRestrictionPlayer1] = useState('');
  const [restrictionPlayer2, setRestrictionPlayer2] = useState('');

  const handleAddCurrentRestriction = () => {
    onAddRestriction([restrictionPlayer1, restrictionPlayer2]);
    setRestrictionPlayer1('');
    setRestrictionPlayer2('');
  };

  const participantOptions = allParticipants.map(p => ({ value: p, label: p }));

  return (
    <Card className="bg-card/80 border-accent shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline text-accent-foreground bg-accent p-3 rounded-t-md -m-px">
          Configurar Sorteio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Participants Section */}
        <div className="space-y-3">
          <Label htmlFor="participants" className="text-xl flex items-center text-muted-foreground">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Lista de Participantes
          </Label>
          <Textarea
            id="participants"
            value={participantsText}
            onChange={(e) => onParticipantsChange(e.target.value)}
            placeholder="Digite os nomes dos jogadores, um por linha..."
            rows={10}
            className={`bg-white/90 border-2 ${participantCount < MIN_PARTICIPANTS && participantsText.length > 0 ? 'border-destructive focus:ring-destructive' : 'border-primary/50 focus:border-primary'} text-foreground min-h-[150px] resize-y`}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Participantes: <span className="font-bold text-white">{participantCount}</span>
            </p>
            {participantCount < MIN_PARTICIPANTS && participantsText.length > 0 && (
              <p className="text-sm text-destructive">Mínimo de {MIN_PARTICIPANTS} participantes</p>
            )}
          </div>
        </div>

        {/* Team Configuration Section */}
        <div className="space-y-3">
          <Label className="text-xl flex items-center text-muted-foreground">
            <Settings2 className="mr-2 h-6 w-6 text-primary" />
            Como dividir os times?
          </Label>
          <RadioGroup
            value={teamSplitType}
            onValueChange={(value: 'byTeamCount' | 'byPlayerCount') => onTeamSplitTypeChange(value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              { value: 'byTeamCount', label: 'Por quantidade de times', inputVal: teamCount, setter: onTeamCountChange, placeholder: "Nº de times" },
              { value: 'byPlayerCount', label: 'Por jogadores por time', inputVal: playersPerTeam, setter: onPlayersPerTeamChange, placeholder: "Jogadores/time" },
            ].map(option => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out
                  ${teamSplitType === option.value ? 'bg-primary/30 border-primary shadow-lg' : 'bg-white/20 border-transparent hover:border-primary/50'}
                `}
              >
                <div className="flex items-center mb-2">
                  <RadioGroupItem value={option.value} id={option.value} className="mr-3 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <span className="font-semibold text-white">{option.label}</span>
                </div>
                {teamSplitType === option.value && (
                  <Input
                    type="number"
                    min="1"
                    value={option.inputVal}
                    onChange={(e) => option.setter(e.target.value)}
                    placeholder={option.placeholder}
                    className="w-full mt-2 bg-white/90 border-primary/50 text-foreground focus:border-primary"
                    onClick={(e) => e.stopPropagation()} // Prevent label click from unchecking radio
                  />
                )}
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Panelinha Firewall Section */}
        <div className="space-y-3">
          <Label className="text-xl flex items-center text-muted-foreground">
            <ShieldAlert className="mr-2 h-6 w-6 text-primary" />
            🚫 Firewall da Panela
          </Label>
          <p className="text-sm text-muted-foreground">Jogadores que NÃO podem ficar no mesmo time.</p>
          <Card className="bg-white/20 p-4 border-primary/30">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-2 mb-3 items-end">
                <div className="flex-1 w-full sm:w-auto">
                  <Label htmlFor="player1" className="text-xs text-muted-foreground">Jogador 1</Label>
                   <Select value={restrictionPlayer1} onValueChange={setRestrictionPlayer1}>
                    <SelectTrigger id="player1" className="w-full bg-white/90 border-primary/50 text-foreground">
                      <SelectValue placeholder="Selecione Jogador 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {participantOptions.filter(p => p.value !== restrictionPlayer2).map(p => (
                        <SelectItem key={`p1-${p.value}`} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <Label htmlFor="player2" className="text-xs text-muted-foreground">Jogador 2</Label>
                  <Select value={restrictionPlayer2} onValueChange={setRestrictionPlayer2}>
                    <SelectTrigger id="player2" className="w-full bg-white/90 border-primary/50 text-foreground">
                      <SelectValue placeholder="Selecione Jogador 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {participantOptions.filter(p => p.value !== restrictionPlayer1).map(p => (
                        <SelectItem key={`p2-${p.value}`} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddCurrentRestriction} 
                  variant="outline" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-primary-foreground border-primary hover:border-primary/80"
                  disabled={!restrictionPlayer1 || !restrictionPlayer2 || restrictionPlayer1 === restrictionPlayer2}
                >
                  <Plus className="h-5 w-5 mr-1" /> Adicionar
                </Button>
              </div>
              {panelinhaRestrictions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Restrições Ativas:</p>
                  <div className="flex flex-wrap gap-2">
                    {panelinhaRestrictions.map((pair, index) => (
                      <Badge key={index} className="bg-accent text-accent-foreground text-sm py-1 px-3">
                        {pair[0]} <X className="h-3 w-3 mx-1 text-primary/70" /> {pair[1]}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-5 w-5 hover:bg-primary/50"
                          onClick={() => onRemoveRestriction(index)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={onSubmit}
            disabled={isSubmitDisabled || isLoading}
            className="w-full sm:flex-1 text-lg py-6 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-400"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <SoccerBallIcon className="mr-2 h-6 w-6" />
            )}
            {isLoading ? 'Gerando...' : 'Gerar Equipes'}
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary"
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Limpar Formulário
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
