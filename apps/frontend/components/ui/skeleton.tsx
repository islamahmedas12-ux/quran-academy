"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular";
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", width, height, style, ...props }, ref) => {
    const variantStyles = {
      default: "rounded-lg",
      text: "rounded h-4",
      circular: "rounded-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-slate-200",
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

export { Skeleton };