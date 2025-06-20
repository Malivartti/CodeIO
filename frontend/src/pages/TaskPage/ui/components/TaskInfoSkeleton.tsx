import { FC } from 'react';

const TaskInfoSkeleton: FC = () => {
  return (
    <div className="space-y-6 h-full animate-pulse">
      <div className="rounded-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <div className="h-6 sm:h-8 bg-surface-unaccent rounded-md w-3/4 mb-2" />
          </div>
          <div className="flex items-center">
            <div className="h-5 bg-surface-unaccent rounded w-16 mr-2" />
            <div className="w-6 h-6 bg-surface-unaccent rounded" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <div className="h-7 bg-surface-unaccent rounded-md w-20 px-2 py-1" />
          <div className="flex items-center">
            <div className="w-4 h-4 bg-surface-unaccent rounded mr-1.5" />
            <div className="h-5 bg-surface-unaccent rounded w-12" />
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-surface-unaccent rounded mr-1.5" />
            <div className="h-5 bg-surface-unaccent rounded w-12" />
          </div>
        </div>

        <div className="mb-6">
          <div className="h-5 bg-surface-unaccent rounded w-12 mb-2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-7 bg-surface-unaccent rounded-full w-16" />
            <div className="h-7 bg-surface-unaccent rounded-full w-20" />
            <div className="h-7 bg-surface-unaccent rounded-full w-14" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-surface-unaccent rounded w-full" />
          <div className="h-4 bg-surface-unaccent rounded w-5/6" />
          <div className="h-4 bg-surface-unaccent rounded w-4/5" />
          <div className="h-4 bg-surface-unaccent rounded w-full" />
          <div className="h-4 bg-surface-unaccent rounded w-3/4" />
          <div className="h-4 bg-surface-unaccent rounded w-5/6" />
          <div className="h-4 bg-surface-unaccent rounded w-2/3" />
          <div className="h-4 bg-surface-unaccent rounded w-4/5" />
          <div className="h-4 bg-surface-unaccent rounded w-full" />
          <div className="h-4 bg-surface-unaccent rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default TaskInfoSkeleton;
