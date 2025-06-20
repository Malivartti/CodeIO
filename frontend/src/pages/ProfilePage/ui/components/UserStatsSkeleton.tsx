import { FC } from 'react';

const UserStatsSkeleton: FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div className="h-6 bg-surface-unaccent rounded w-40" />
          <div className="h-4 bg-surface-unaccent rounded w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-canvas border border-surface rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 bg-surface-unaccent rounded w-16" />
                <div className="h-4 bg-surface-unaccent rounded w-12" />
              </div>
              <div className="h-2 bg-surface-unaccent rounded mb-2" />
              <div className="h-3 bg-surface-unaccent rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div className="h-6 bg-surface-unaccent rounded w-48" />
          <div className="h-4 bg-surface-unaccent rounded w-32" />
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-max">
            <div className="flex gap-1 mb-4 ml-8">
              {Array.from({ length: 53 }, (_, i) => (
                <div key={i} className="w-3">
                  {i % 4 === 0 && (
                    <div className="h-3 bg-surface-unaccent rounded w-3" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col gap-1 mr-1">
                <div className="h-3 w-6"></div>
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-3 w-6">
                    {i % 2 === 0 && (
                      <div className="h-3 bg-surface-unaccent rounded w-4" />
                    )}
                  </div>
                ))}
              </div>

              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  <div className="h-3 w-3"></div>
                  {Array.from({ length: 7 }, (_, dayIndex) => (
                    <div key={dayIndex} className="w-3 h-3 bg-surface-unaccent rounded-sm" />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface">
              <div className="flex items-center gap-2">
                <div className="h-3 bg-surface-unaccent rounded w-12" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="w-3 h-3 bg-surface-unaccent rounded-sm" />
                  ))}
                </div>
                <div className="h-3 bg-surface-unaccent rounded w-12" />
              </div>
              <div className="h-3 bg-surface-unaccent rounded w-40" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-6 bg-surface-unaccent rounded w-8 mx-auto mb-1" />
              <div className="h-3 bg-surface-unaccent rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-surface-unaccent rounded w-48" />
          <div className="h-4 bg-surface-unaccent rounded w-24" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-canvas border border-surface rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-4 bg-surface-unaccent rounded w-8" />
                <div className="h-4 bg-surface-unaccent rounded flex-1 max-w-xs" />
              </div>
              <div className="h-4 bg-surface-unaccent rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStatsSkeleton;
