
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="py-6 text-center text-white shadow-md bg-black/20">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-1">
          <svg
            width="60"
            height="60"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-0 sm:mr-3 mb-2 sm:mb-0"
            data-ai-hint="La Liga football symbol"
          >
            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="5" fill="none" />
            <path
              d="M50 25 C 65 30, 70 45, 50 52 C 30 45, 35 30, 50 25 Z M50 75 C 35 70, 30 55, 50 48 C 70 55, 65 70, 50 75 Z"
              fill="white"
            />
            <circle cx="50" cy="50" r="10" fill="white" />
          </svg>
          <h1 className="text-3xl md:text-4xl font-headline">
            BraLiga - <span className="text-white">Edition: Anti-Panela</span>
          </h1>
        </div>
        <p className="text-lg text-white/70">Uma luta dos peladeiros do BRA contra a Panela</p>
      </div>
    </header>
  );
}
