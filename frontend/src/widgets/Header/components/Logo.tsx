import { NavigationHelpers } from '@shared/lib/routes';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  isAuthenticated: boolean;
  isSuperuser: boolean;
  className?: string;
}

const Logo: FC<Props> = ({ isAuthenticated, isSuperuser, className }) => {
  return (
    <Link
      to={NavigationHelpers.getDefaultRouteForUser(isAuthenticated, isSuperuser)}
      className={`flex items-center space-x-2 relative ${className || ''}`}
    >
      <div className="p-2 bg-brand rounded-lg flex items-center justify-center">
        <span className="text-inverse font-bold text-sm">CodeIO</span>
      </div>
    </Link>
  );
};

export default Logo;
