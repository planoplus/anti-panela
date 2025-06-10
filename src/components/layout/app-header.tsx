
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="py-6 text-center text-white shadow-md bg-black/20">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-1">
          <Image 
            src="https://placehold.co/212x80.png" 
            alt="BraLiga Logo" 
            width={212} 
            height={80} 
            className="mr-0 sm:mr-3 mb-2 sm:mb-0"
            data-ai-hint="soccer logo"
          />
          <h1 className="text-4xl md:text-5xl font-headline">
            BraLiga - <span className="text-white">Edition: Anti-Panela</span>
          </h1>
        </div>
        <p className="text-lg text-white/70">Uma luta dos peladeiros do BRA contra a Panela</p>
      </div>
    </header>
  );
}
