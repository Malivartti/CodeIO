import { PagesWithoutHeaderPaths } from '@app/routes/AppRoutePages';
import { AppRoutes } from '@shared/types/routes';
import Header from '@widgets/Header';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const shouldShowHeader = !PagesWithoutHeaderPaths.has(
    location.pathname as AppRoutes
  );

  return (
    <div className="min-h-screen bg-canvas">
      {shouldShowHeader && <Header />}
      {children}
    </div>
  );
};
