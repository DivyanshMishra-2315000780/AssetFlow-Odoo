import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none'
    const variants: Record<string, string> = {
      default: 'bg-card border border-border text-foreground hover:bg-muted',
      ghost: 'bg-transparent text-foreground hover:bg-muted/50',
      primary: 'bg-primary text-white hover:bg-primary/90',
    }

    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
    )
  }
)
Button.displayName = 'Button'
