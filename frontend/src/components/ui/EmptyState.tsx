import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state panel">
      <div className="empty-state__icon">▦</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
