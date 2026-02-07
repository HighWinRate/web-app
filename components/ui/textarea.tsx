import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    if (label || error) {
      return (
        <div className="w-full space-y-2">
          {label && (
            <label className="block text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          <textarea
            className={cn(
              "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none md:text-sm",
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
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
