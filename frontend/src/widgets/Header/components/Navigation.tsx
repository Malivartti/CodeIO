import { FC } from 'react';
import { Link } from 'react-router-dom';

interface NavigationItem {
  to: string;
  label: string;
}

interface Props {
  items: NavigationItem[];
  variant: 'horizontal' | 'vertical';
  onItemClick?: () => void;
  className?: string;
}

const Navigation: FC<Props> = ({ items, variant, onItemClick, className }) => {
  const baseClasses = variant === 'horizontal'
    ? 'flex items-center space-x-6'
    : 'space-y-2';

  const linkClasses = variant === 'horizontal'
    ? 'text-medium hover:text-strong transition-colors'
    : 'block py-2 text-medium hover:text-strong hover:bg-hover rounded-md transition-colors';

  return (
    <nav className={`${baseClasses} ${className || ''}`}>
      {items.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={linkClasses}
          onClick={onItemClick}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
