/**
 * @file components/ui/textarea.tsx
 * @description Textarea shadcn com estilo tailwind consistente.
 * Suporta estados de erro, disabled e focus ring.
 */
import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Mensagem de erro opcional exibida abaixo do campo */
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        ) : null}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
