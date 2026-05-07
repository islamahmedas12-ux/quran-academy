import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "white";
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "primary", ...props }, ref) => {
    const sizes = {
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-8 h-8 border-3",
      xl: "w-12 h-12 border-4",
    };

    const variants = {
      primary: "border-primary/20 border-t-primary",
      secondary: "border-secondary/20 border-t-secondary",
      accent: "border-accent/20 border-t-accent",
      white: "border-white/20 border-t-white",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full animate-spin",
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, message, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  )
);
LoadingOverlay.displayName = "LoadingOverlay";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "card";
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", width, height, style, ...props }, ref) => {
    const variantStyles = {
      default: "rounded-xl",
      text: "rounded h-4",
      circular: "rounded-full",
      card: "rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer",
          variantStyles[variant],
          className
        )}
        style={{
          width: width,
          height: height || (variant === "text" ? "1rem" : undefined),
          ...style,
        }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

const SkeletonCard = () => (
  <div className="rounded-2xl border bg-card p-6 space-y-4">
    <Skeleton variant="text" className="w-1/3" />
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-2/3" />
    <div className="flex gap-2">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  </div>
);

const SkeletonVerse = () => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100">
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" className="h-8 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="default" width={80} height={32} />
          <Skeleton variant="default" width={100} height={32} />
        </div>
      </div>
    </div>
  </div>
);

export { LoadingSpinner, LoadingOverlay, Skeleton, SkeletonCard, SkeletonVerse };
