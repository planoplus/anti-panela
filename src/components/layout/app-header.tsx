
import Image from 'next/image';
import { SoccerBallIcon } from '@/components/icons/soccer-ball-icon';

export function AppHeader() {
  return (
    <header className="py-6 text-center text-white shadow-md bg-black/20">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-1">
          <SoccerBallIcon
            className="text-white mr-0 sm:mr-3 mb-2 sm:mb-0 h-[60px] w-[60px]"
            data-ai-hint="soccer ball"
          />
          <h1 className="text-3xl md:text-4xl font-headline">
            BraLiga - <span className="text-white">Edition: Anti-Panela</span>
          </h1>
        </div>
        <p className="text-lg text-white/70">Uma luta dos peladeiros do BRA contra a Panela</p>
      </div>
    </header>
  );
}
