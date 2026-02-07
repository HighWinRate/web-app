import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    if (label || error) {
      return (
        <div className="w-full space-y-2">
          {label && (
            <label className="block text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-base ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error ? 'border-destructive focus-visible:ring-destructive' : '',
              className
            )}
            ref={ref}
            {...props}
          />
          {error && <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-base ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
