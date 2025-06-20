import LeftArrowIcon from '@shared/assets/icons/LeftArrow.svg';
import RightArrowIcon from '@shared/assets/icons/RightArrow.svg';
import { default as cn } from 'classnames';
import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-md',
          currentPage === 1
            ? 'text-subtle cursor-not-allowed'
            : 'hover:bg-surface-hover text-strong'
        )}
      >
        <LeftArrowIcon width={24} height={24} />
      </button>

      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'w-8 h-8 rounded-md text-sm',
            page === currentPage
              ? 'bg-brand text-inverse'
              : 'hover:bg-surface-hover text-strong'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-md',
          currentPage === totalPages
            ? 'text-subtle cursor-not-allowed'
            : 'hover:bg-surface-hover text-strong'
        )}
      >
        <RightArrowIcon width={24} height={24} />
      </button>
    </div>
  );
};

export default Pagination;
