import SearchIcon from '@shared/assets/icons/Search.svg';
import { default as cn } from 'classnames';
import React, { FC, useCallback,useEffect, useState } from 'react';

interface Props {
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: FC<Props> = ({
  className,
  value,
  onValueChange,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onValueChange(inputValue);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onValueChange, value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  return (
    <div className={cn('relative flex-1 max-w-md', className)}>
      <SearchIcon
        width={16}
        height={16}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle"
      />
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={inputValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 border border-surface rounded-md focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-surface-accent bg-surface text-strong placeholder-subtle transition-colors"
      />
    </div>
  );
};

export default SearchInput;
