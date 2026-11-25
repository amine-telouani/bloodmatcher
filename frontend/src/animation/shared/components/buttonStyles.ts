type Variant = 'primary' | 'secondary' | 'quiet' | 'onDark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,translate,scale] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-red-dark text-white hover:bg-red-deep hover:-translate-y-px',
  secondary: 'bg-paper text-ink ring-1 ring-ink/25 hover:ring-ink/60 hover:-translate-y-px',
  quiet: 'text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink',
  onDark: 'text-cream hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return [base, variants[variant], variant === 'quiet' ? 'h-auto px-0' : sizes[size], extra].join(' ')
}
