import { tagsStore } from '@entities/admin';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import DeleteIcon from '@shared/assets/icons/Delete.svg';
import EditIcon from '@shared/assets/icons/Edit.svg';
import TickIcon from '@shared/assets/icons/Tick.svg';
import ConfirmModal from '@shared/ui/ConfirmModal';
import { observer } from 'mobx-react-lite';
import { FC, useState } from 'react';

interface DeleteModalState {
  isOpen: boolean;
  tagId: number | null;
  tagName: string;
}

interface Props {
  isLoading: boolean;
}

const TagsList: FC<Props> = observer(({ isLoading }) => {
  const { filteredTags, isUpdating, isDeleting, editingTagId } = tagsStore;
  const [editingName, setEditingName] = useState('');
  const [editingError, setEditingError] = useState('');

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    tagId: null,
    tagName: '',
  });

  const handleEditStart = (tag: { id: number; name: string }) => {
    tagsStore.setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingError('');
  };

  const handleEditCancel = () => {
    tagsStore.setEditingTagId(null);
    setEditingName('');
    setEditingError('');
  };

  const handleEditSave = async (tagId: number) => {
    if (!editingName.trim()) {
      setEditingError('Название тега обязательно');
      return;
    }

    if (editingName.trim().length < 2) {
      setEditingError('Название тега должно содержать минимум 2 символа');
      return;
    }

    if (editingName.trim().length > 50) {
      setEditingError('Название тега не должно превышать 50 символов');
      return;
    }

    setEditingError('');
    const success = await tagsStore.updateTag(tagId, editingName);
    if (success) {
      setEditingName('');
    }
  };

  const handleDeleteClick = (tag: { id: number; name: string }) => {
    setDeleteModal({
      isOpen: true,
      tagId: tag.id,
      tagName: tag.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.tagId) return;

    const success = await tagsStore.deleteTag(deleteModal.tagId);
    if (success) {
      setDeleteModal({
        isOpen: false,
        tagId: null,
        tagName: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;

    setDeleteModal({
      isOpen: false,
      tagId: null,
      tagName: '',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-surface rounded-xl overflow-hidden">
        <div className="animate-pulse">
          <div className="border-b border-surface bg-surface p-4">
            <div className="h-4 bg-surface-unaccent rounded w-24" />
          </div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="border-b border-surface p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-surface-unaccent rounded w-32" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-surface-unaccent rounded" />
                  <div className="w-8 h-8 bg-surface-unaccent rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredTags.length === 0) {
    return (
      <div className="bg-surface border border-surface rounded-xl p-8">
        <div className="text-center">
          <p className="text-medium text-lg mb-2">Теги не найдены</p>
          <p className="text-subtle">Создайте первый тег или измените параметры поиска</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface border border-surface rounded-xl overflow-hidden">
        <div className="border-b border-surface bg-surface px-6 py-4">
          <h3 className="text-sm font-semibold text-strong">Список тегов</h3>
        </div>

        <div className="divide-y divide-surface">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="px-6 py-4 hover:bg-surface-hover transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  {editingTagId === tag.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-surface rounded-md bg-canvas text-strong focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="Название тега"
                        disabled={isUpdating}
                        maxLength={50}
                      />
                      {editingError && (
                        <p className="mt-1 text-sm text-error">{editingError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-strong font-medium">{tag.name}</span>
                      <span className="px-2 py-0.5 bg-brand-light text-brand text-xs rounded-full">
                        ID: {tag.id}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingTagId === tag.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(tag.id)}
                        disabled={isUpdating || !editingName.trim()}
                        className="p-2 text-success hover:bg-success-light border border-surface hover:border-success rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Сохранить"
                      >
                        {isUpdating ? (
                          <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TickIcon width={16} height={16} />
                        )}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        disabled={isUpdating}
                        className="p-2 text-error hover:bg-error-light border border-surface hover:border-error rounded-md transition-colors disabled:opacity-50"
                        title="Отмена"
                      >
                        <CrossIcon width={16} height={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(tag)}
                        disabled={editingTagId !== null}
                        className="p-2 text-subtle hover:text-brand border border-surface hover:border-brand rounded-md transition-colors disabled:opacity-50"
                        title="Редактировать"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tag)}
                        disabled={editingTagId !== null || isDeleting}
                        className="p-2 text-subtle hover:text-error border border-surface hover:border-error rounded-md transition-colors disabled:opacity-50"
                        title="Удалить"
                      >
                        <DeleteIcon width={16} height={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Удаление тега"
        message={`Вы уверены, что хотите удалить тег "${deleteModal.tagName}"? Тег будет удален у всех связанных задач.`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
});

export default TagsList;
