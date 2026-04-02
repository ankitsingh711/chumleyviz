import { cn } from '@/lib/cn';

export function BrandMark({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <div className={cn('brand-mark', inverted && 'brand-mark--inverted', compact && 'brand-mark--compact')}>
      <span className="brand-mark__icon" aria-hidden="true">
        <span className="brand-mark__cell brand-mark__cell--square" />
        <span className="brand-mark__cell brand-mark__cell--square" />
        <span className="brand-mark__cell brand-mark__cell--bar" />
        <span className="brand-mark__cell brand-mark__cell--beam" />
      </span>
      <span className="brand-mark__word">aspect</span>
    </div>
  );
}
