import { tagsStore } from '@entities/admin';
import { observer } from 'mobx-react-lite';
import React, { FC, useState } from 'react';

const CreateTagForm: FC = observer(() => {
  const [tagName, setTagName] = useState('');
  const [error, setError] = useState('');
  const { isCreating } = tagsStore;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagName.trim()) {
      setError('Название тега обязательно');
      return;
    }

    if (tagName.trim().length < 2) {
      setError('Название тега должно содержать минимум 2 символа');
      return;
    }

    if (tagName.trim().length > 50) {
      setError('Название тега не должно превышать 50 символов');
      return;
    }

    setError('');
    const success = await tagsStore.createTag(tagName);
    if (success) {
      setTagName('');
    }
  };

  const handleInputChange = (value: string) => {
    setTagName(value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-surface p-6">
      <h2 className="text-lg font-semibold text-strong mb-4">Создать новый тег</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tagName" className="block text-sm font-medium text-strong mb-2">
            Название тега
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="Введите название тега"
                disabled={isCreating}
                maxLength={50}
              />
              {error && (
                <p className="mt-1 text-sm text-error">{error}</p>
              )}
              <p className="mt-1 text-xs text-subtle">
                От 2 до 50 символов
              </p>
            </div>
            <button
              type="submit"
              disabled={isCreating || !tagName.trim()}
              className="px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  Создать тег
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});

export default CreateTagForm;
