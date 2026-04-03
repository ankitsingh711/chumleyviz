import { cn } from '@/lib/cn';

export function BrandMark({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  const logoSrc = inverted ? '/aspect-logo-inverted.svg' : '/aspect-logo.svg';

  return (
    <div className={cn('brand-mark', inverted && 'brand-mark--inverted', compact && 'brand-mark--compact')}>
      <img className="brand-mark__image" src={logoSrc} alt="Aspect" />
    </div>
  );
}
