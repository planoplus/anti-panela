
import type React from 'react';

interface SoccerBallIconProps extends React.SVGProps<SVGSVGElement> {}

export function SoccerBallIcon({ className, ...props }: SoccerBallIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a4.7 4.7 0 0 1 4 2.5L19.5 8l-2.3 4.5-4.2-2.3L12 2Z" />
      <path d="M2.5 6.5A4.7 4.7 0 0 1 7 4l4.2 2.3L8.5 12.5 2.5 6.5Z" />
      <path d="m12 22 4-2.5L12.5 15l-4.2 2.3L12 22Z" />
      <path d="M15.5 12.5 17 10.2l2.5 1.3L17.2 16l-1.7-3.5Z" />
      <path d="M2.8 16A4.7 4.7 0 0 1 7 20l1.7-3.5L6.5 14l-3.7 2Z" />
    </svg>
  );
}
