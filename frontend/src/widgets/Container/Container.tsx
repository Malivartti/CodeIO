import { FC, ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl pt-20 mx-auto px-4 sm:px-6 lg:px-8 pb-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
