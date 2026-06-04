export default function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const colors = {
    primary: 'border-primary/20 border-t-primary',
    white:   'border-white/30 border-t-white',
    emerald: 'border-emerald-200 border-t-emerald-600',
  };

  return (
    <div
      role="status"
      aria-label="Memuat..."
      className={`
        rounded-full animate-spin
        ${sizes[size] ?? sizes.md}
        ${colors[color] ?? colors.primary}
      `}
    />
  );
}
