import { cn } from "@/lib/utils";

interface MSFSLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MSFSLogo = ({ className, size = "md" }: MSFSLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto", 
    lg: "h-16 w-auto"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <svg
        viewBox="0 0 200 60"
        className={cn(sizeClasses[size], "text-foreground")}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* MSFS 2024 Logo Recreation */}
        <defs>
          <linearGradient id="msfsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B4FF" />
            <stop offset="50%" stopColor="#0078D4" />
            <stop offset="100%" stopColor="#004578" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E3E3E3" />
          </linearGradient>
        </defs>

        {/* Simplified Flight Icon */}
        <g transform="translate(5,20)">
          <path
            d="M2 20 L10 16 L18 20 L22 18 L18 22 L10 24 L2 20 Z"
            fill="url(#msfsGradient)"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <circle
            cx="12"
            cy="20"
            r="2"
            fill="url(#msfsGradient)"
          />
        </g>

        {/* MSFS Text - Larger and Bolder */}
        <g transform="translate(35,15)">
          <text
            x="0"
            y="20"
            fontSize="18"
            fontWeight="900"
            fontFamily="Arial Black, Arial, sans-serif"
            fill="currentColor"
            letterSpacing="1px"
          >
            MSFS
          </text>
          <text
            x="0"
            y="40"
            fontSize="14"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
            fill="url(#msfsGradient)"
            letterSpacing="2px"
          >
            2024
          </text>
        </g>

        {/* Subtitle */}
        <g transform="translate(120,20)">
          <text
            x="0"
            y="15"
            fontSize="9"
            fontWeight="600"
            fontFamily="Segoe UI, Arial, sans-serif"
            fill="currentColor"
            opacity="0.9"
          >
            Microsoft
          </text>
          <text
            x="0"
            y="27"
            fontSize="9"
            fontWeight="600"
            fontFamily="Segoe UI, Arial, sans-serif"
            fill="currentColor"
            opacity="0.9"
          >
            Flight Simulator
          </text>
        </g>
      </svg>
    </div>
  );
};