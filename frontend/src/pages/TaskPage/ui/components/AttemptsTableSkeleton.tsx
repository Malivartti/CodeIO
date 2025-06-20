import { FC } from 'react';

interface AttemptsTableSkeletonProps {
  rowsCount?: number;
}

const AttemptsTableSkeleton: FC<AttemptsTableSkeletonProps> = ({ rowsCount = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="block md:hidden space-y-3">
        {Array.from({ length: rowsCount }, (_, index) => (
          <div key={index} className="bg-surface border border-surface rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-surface-unaccent rounded w-24" />
                <div className="h-3 bg-surface-unaccent rounded w-16" />
              </div>
              <div className="h-6 bg-surface-unaccent rounded-full w-20" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="h-3 bg-surface-unaccent rounded w-12" />
                <div className="h-4 bg-surface-unaccent rounded w-16" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-surface-unaccent rounded w-14" />
                <div className="h-4 bg-surface-unaccent rounded w-12" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-surface-unaccent rounded w-10" />
                <div className="h-4 bg-surface-unaccent rounded w-8" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-surface-unaccent rounded w-16" />
                <div className="h-4 bg-surface-unaccent rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-surface">
              {['Время', 'Язык', 'Статус', 'Время', 'Память', 'Тест', 'Подробнее'].map((header, index) => (
                <th key={index} className="p-3 text-left">
                  <div className="h-4 bg-surface-unaccent rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }, (_, index) => (
              <tr key={index} className="border-b border-surface">
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-32" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-16" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-20" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-12" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-14" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-8" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-surface-unaccent rounded w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttemptsTableSkeleton;
