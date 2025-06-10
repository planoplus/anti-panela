
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="py-6 text-center text-white shadow-md bg-black/20">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-1">
          <h1 className="text-3xl md:text-4xl font-headline">
            <strong className="font-black">BraLiga</strong> - <span className="font-normal text-white/80">Edition: Anti-Panela</span>
          </h1>
        </div>
        <p className="text-lg text-white/70">Uma luta dos peladeiros do BRA contra a Panela</p>
      </div>
    </header>
  );
}
