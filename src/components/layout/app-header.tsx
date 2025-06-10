
import { SoccerBallIcon } from '@/components/icons/soccer-ball-icon';

export function AppHeader() {
  return (
    <header className="py-6 text-center text-white shadow-md bg-black/20">
      <div className="container mx-auto">
        <div className="flex items-center justify-center mb-1">
          <SoccerBallIcon className="h-10 w-10 mr-3 text-primary" />
          <h1 className="text-4xl md:text-5xl font-headline">
            BraLiga - <span className="text-primary">Edition: Anti-Panela</span>
          </h1>
        </div>
        <p className="text-lg text-white/70">Sorteador justo de equipes para futebol</p>
      </div>
    </header>
  );
}
