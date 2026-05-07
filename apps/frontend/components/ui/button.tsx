import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "success" | "accent";
  size?: "sm" | "md" | "lg" | "icon" | "lg-icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      outline: "border-2 border-input bg-background hover:bg-accent/10 hover:border-primary hover:text-primary",
      ghost: "hover:bg-accent/10 hover:text-primary",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      link: "text-primary underline-offset-4 hover:underline",
      success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md",
      accent: "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2 font-semibold",
      icon: "h-10 w-10 rounded-xl",
      "lg-icon": "h-12 w-12 rounded-xl",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
