import { FC } from 'react';

const LeaderboardSkeleton: FC = () => {
  return (
    <div className="animate-pulse">
      <div className="block md:hidden space-y-3">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="bg-surface border border-surface rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-surface-unaccent rounded" />
              <div className="w-12 h-12 bg-surface-unaccent rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-surface-unaccent rounded w-32" />
                <div className="flex gap-4">
                  <div className="h-4 bg-surface-unaccent rounded w-16" />
                  <div className="h-4 bg-surface-unaccent rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-surface border border-surface rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface bg-surface-accent">
              <th className="px-6 py-4">
                <div className="h-4 bg-surface-unaccent rounded w-12" />
              </th>
              <th className="px-6 py-4">
                <div className="h-4 bg-surface-unaccent rounded w-20" />
              </th>
              <th className="px-6 py-4">
                <div className="h-4 bg-surface-unaccent rounded w-12 ml-auto" />
              </th>
              <th className="px-6 py-4">
                <div className="h-4 bg-surface-unaccent rounded w-20 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color-surface)]">
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="h-6 bg-surface-unaccent rounded w-8" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-unaccent rounded-full" />
                    <div className="h-5 bg-surface-unaccent rounded w-32" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-surface-unaccent rounded w-12 ml-auto" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-surface-unaccent rounded w-8 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;
