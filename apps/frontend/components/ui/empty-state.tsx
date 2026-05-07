import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LoadingSpinner } from "./loading";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  isLoading?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, isLoading, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center py-12 px-4",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="lg" className="mb-4" />
        ) : icon ? (
          <div className="mb-4 p-4 rounded-full bg-slate-100 text-slate-400">
            {icon}
          </div>
        ) : (
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-slate-200 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="sm">
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

interface EmptyStateCardProps extends EmptyStateProps {
  className?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-dashed border-slate-200 bg-slate-50/50",
      className
    )}
  >
    <EmptyState {...props} />
  </div>
);

export { EmptyState, EmptyStateCard };
