import { FC } from 'react';

interface Props {
  className?: string;
  showStatus: boolean;
  rowsCount?: number;
}

const TasksListSkeleton: FC<Props> = ({ className, showStatus, rowsCount = 10 }) => {
  return (
    <div className={className}>
      <div className="block md:hidden space-y-3">
        {Array.from({ length: rowsCount }, (_, index) => (
          <div key={index} className="bg-surface border border-surface rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-4 bg-surface-unaccent rounded" />
              {showStatus && (
                <div className="w-6 h-6 bg-surface-unaccent rounded" />
              )}
            </div>

            <div className="mb-3">
              <div className="w-full h-4 bg-surface-unaccent rounded mb-2" />
              <div className="w-3/4 h-4 bg-surface-unaccent rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div className="w-12 h-4 bg-surface-unaccent rounded" />
              <div className="w-16 h-4 bg-surface-unaccent rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-hidden rounded-lg border border-surface bg-surface">
        <table className="w-full">
          <tbody className="divide-y divide-[var(--border-color-surface)]">
            {Array.from({ length: rowsCount }, (_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-4 py-3 w-10">
                  <div className="w-5 h-5 bg-surface-unaccent rounded" />
                </td>

                {showStatus && (
                  <td className="px-4 py-3 w-10">
                    <div className="flex justify-center">
                      <div className="w-5 h-5 bg-surface-unaccent rounded" />
                    </div>
                  </td>
                )}

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-surface-unaccent rounded" />
                    <div className="w-58 h-4 bg-surface-unaccent rounded" />
                  </div>
                </td>

                <td className="px-4 py-3 w-24 text-right">
                  <div className="w-12 h-4 bg-surface-unaccent rounded ml-auto" />
                </td>

                <td className="px-4 py-3 w-28 text-right">
                  <div className="w-16 h-4 bg-surface-unaccent rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksListSkeleton;
