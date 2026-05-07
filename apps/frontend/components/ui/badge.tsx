import * as React from "react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  status?: Status;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", status, children, ...props }, ref) => {
    const statusVariant: Record<Status, BadgeProps["variant"]> = {
      active: "success",
      inactive: "error",
      pending: "warning",
    };

    const resolvedVariant = status ? statusVariant[status] : variant;

    const variants = {
      default: "bg-primary/10 text-primary border-primary/20",
      success: "bg-emerald-100 text-emerald-800 border-emerald-200",
      warning: "bg-amber-100 text-amber-800 border-amber-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
      outline: "bg-transparent border-current text-foreground",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          variants[resolvedVariant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
