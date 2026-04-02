import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ isOpen, title, description, children, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p className="modal-card__description">{description}</p> : null}
          </div>
          <button type="button" className={cn('icon-button', 'icon-button--ghost')} onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
