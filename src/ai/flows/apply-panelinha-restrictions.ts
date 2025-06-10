// Apply panelinha restrictions flow.

'use server';

/**
 * @fileOverview Prevents specified players from being placed on the same team.
 *
 * - applyPanelinhaRestrictions - A function that applies panelinha restrictions to a list of players and team configuration.
 * - ApplyPanelinhaRestrictionsInput - The input type for the applyPanelinhaRestrictions function.
 * - ApplyPanelinhaRestrictionsOutput - The return type for the applyPanelinhaRestrictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyPanelinhaRestrictionsInputSchema = z.object({
  players: z.array(z.string()).describe('The list of players to be divided into teams.'),
  teamCount: z.number().optional().describe('The number of teams to create. Mutually exclusive with playersPerTeam.'),
  playersPerTeam: z.number().optional().describe('The number of players per team. Mutually exclusive with teamCount.'),
  panelinhaRestrictions: z
    .array(z.array(z.string()).length(2))
    .describe('A list of player pairs who should not be on the same team.'),
});

export type ApplyPanelinhaRestrictionsInput = z.infer<
  typeof ApplyPanelinhaRestrictionsInputSchema
>;

const ApplyPanelinhaRestrictionsOutputSchema = z.array(
  z.array(z.string()).describe('A list of teams, each containing a list of players.')
);

export type ApplyPanelinhaRestrictionsOutput = z.infer<
  typeof ApplyPanelinhaRestrictionsOutputSchema
>;

export async function applyPanelinhaRestrictions(
  input: ApplyPanelinhaRestrictionsInput
): Promise<ApplyPanelinhaRestrictionsOutput> {
  return applyPanelinhaRestrictionsFlow(input);
}

const applyPanelinhaRestrictionsFlow = ai.defineFlow(
  {
    name: 'applyPanelinhaRestrictionsFlow',
    inputSchema: ApplyPanelinhaRestrictionsInputSchema,
    outputSchema: ApplyPanelinhaRestrictionsOutputSchema,
  },
  async input => {
    // Basic input validation.
    if (input.teamCount == null && input.playersPerTeam == null) {
      throw new Error(
        'Either teamCount or playersPerTeam must be specified in the input.'
      );
    }

    if (input.teamCount != null && input.playersPerTeam != null) {
      throw new Error(
        'teamCount and playersPerTeam cannot both be specified.  Choose one.'
      );
    }

    let teams: string[][] = [];

    if (input.teamCount) {
      // Initialize teams
      for (let i = 0; i < input.teamCount; i++) {
        teams.push([]);
      }

      // Distribute players randomly, respecting panelinha restrictions
      const availablePlayers = [...input.players]; // Create a copy to modify

      while (availablePlayers.length > 0) {
        for (let i = 0; i < input.teamCount; i++) {
          if (availablePlayers.length === 0) break; // All players assigned

          // Find a suitable player for the current team
          let playerIndex = Math.floor(Math.random() * availablePlayers.length);
          let selectedPlayer = availablePlayers[playerIndex];

          // Check panelinha restrictions
          let isValid = true;
          for (const teamMate of teams[i]) {
            if (
              input.panelinhaRestrictions?.some(
                ([player1, player2]) =>
                  (player1 === selectedPlayer && player2 === teamMate) ||
                  (player2 === selectedPlayer && player1 === teamMate)
              )
            ) {
              isValid = false;
              break;
            }
          }

          if (isValid) {
            teams[i].push(selectedPlayer);
            availablePlayers.splice(playerIndex, 1);
          } else {
            // Try another player, or skip this team if no suitable player is found
            let attempts = 0;
            let foundValidPlayer = false;
            while (attempts < availablePlayers.length) {
              playerIndex = Math.floor(Math.random() * availablePlayers.length);
              selectedPlayer = availablePlayers[playerIndex];
              isValid = true;
              for (const teamMate of teams[i]) {
                if (
                  input.panelinhaRestrictions?.some(
                    ([player1, player2]) =>
                      (player1 === selectedPlayer && player2 === teamMate) ||
                      (player2 === selectedPlayer && player1 === teamMate)
                  )
                ) {
                  isValid = false;
                  break;
                }
              }
              if (isValid) {
                teams[i].push(selectedPlayer);
                availablePlayers.splice(playerIndex, 1);
                foundValidPlayer = true;
                break;
              }
              attempts++;
            }
            if (!foundValidPlayer) {
              continue; // Skip this team for now
            }
          }
        }
      }
    } else if (input.playersPerTeam) {
      const numTeams = Math.ceil(input.players.length / input.playersPerTeam);
      for (let i = 0; i < numTeams; i++) {
        teams.push([]);
      }

      const availablePlayers = [...input.players];
      let teamIndex = 0;

      while (availablePlayers.length > 0) {
        let playerIndex = Math.floor(Math.random() * availablePlayers.length);
        let selectedPlayer = availablePlayers[playerIndex];
        let isValid = true;

        for (const teamMate of teams[teamIndex]) {
          if (
            input.panelinhaRestrictions?.some(
              ([player1, player2]) =>
                (player1 === selectedPlayer && player2 === teamMate) ||
                (player2 === selectedPlayer && player1 === teamMate)
            )
          ) {
            isValid = false;
            break;
          }
        }

        if (isValid && teams[teamIndex].length < input.playersPerTeam) {
          teams[teamIndex].push(selectedPlayer);
          availablePlayers.splice(playerIndex, 1);
        } else {
          let attempts = 0;
          let foundValidPlayer = false;

          while (attempts < availablePlayers.length) {
            playerIndex = Math.floor(Math.random() * availablePlayers.length);
            selectedPlayer = availablePlayers[playerIndex];
            isValid = true;

            for (const teamMate of teams[teamIndex]) {
              if (
                input.panelinhaRestrictions?.some(
                  ([player1, player2]) =>
                    (player1 === selectedPlayer && player2 === teamMate) ||
                    (player2 === selectedPlayer && player1 === teamMate)
                )
              ) {
                isValid = false;
                break;
              }
            }

            if (isValid) {
              if (teams[teamIndex].length < input.playersPerTeam) {
                teams[teamIndex].push(selectedPlayer);
                availablePlayers.splice(playerIndex, 1);
                foundValidPlayer = true;
                break;
              }
            }
            attempts++;
          }
          if (!foundValidPlayer) {
            teamIndex = (teamIndex + 1) % numTeams;
            continue;
          }
        }
        teamIndex = (teamIndex + 1) % numTeams;
      }
    }

    return teams;
  }
);

