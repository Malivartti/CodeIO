import { FC } from 'react';
interface Props {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: FC<Props> = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-24 h-24 sm:w-32 sm:h-32 text-2xl sm:text-3xl',
  };


  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt="Аватар пользователя"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-brand-light flex items-center justify-center text-brand font-semibold">
          {name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;
