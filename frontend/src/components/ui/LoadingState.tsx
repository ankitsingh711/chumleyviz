export function LoadingState({ label = 'Loading workspace…' }: { label?: string }) {
  return (
    <div className="loading-state panel">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
