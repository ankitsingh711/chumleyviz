import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { FolderMutationInput } from '@/types/models';

const colorOptions = ['#5C4CFF', '#00A6A6', '#FF7A59', '#1B85FF', '#697586'];

interface FolderFormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  initialValues?: FolderMutationInput;
  onClose: () => void;
  onSubmit: (payload: FolderMutationInput) => Promise<void>;
}

export function FolderFormModal({
  isOpen,
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit,
}: FolderFormModalProps) {
  const [formState, setFormState] = useState<FolderMutationInput>({
    name: '',
    color: colorOptions[0],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(
      initialValues ?? {
        name: '',
        color: colorOptions[0],
        description: '',
      },
    );
  }, [initialValues, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formState,
        description: formState.description.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description="Folders organize dashboards for leaders, operators, and analysts."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Folder name</span>
          <input
            className="field__input"
            value={formState.name}
            onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
            placeholder="Executive Oversight"
            minLength={2}
            maxLength={120}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Description</span>
          <textarea
            className="field__input field__input--textarea"
            value={formState.description}
            onChange={(event) =>
              setFormState((state) => ({ ...state, description: event.target.value }))
            }
            placeholder="Dashboards for weekly executive business reviews."
            maxLength={255}
          />
        </label>

        <fieldset className="field">
          <span className="field__label">Color</span>
          <div className="color-swatch-row">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${formState.color === color ? 'color-swatch--selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormState((state) => ({ ...state, color }))}
                aria-label={`Select ${color} as folder color`}
              />
            ))}
          </div>
        </fieldset>

        <div className="modal-card__actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
