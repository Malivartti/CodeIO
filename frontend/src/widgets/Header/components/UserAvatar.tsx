import { userAPI } from '@entities/user';
import { FC, useEffect, useState } from 'react';

interface AvatarProps {
  avatarFilename?: string | null;
  firstName?: string | null;
  requireAuth?: boolean;
}

const Avatar: FC<AvatarProps> = ({
  avatarFilename,
  firstName,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (avatarFilename && !imageError) {
      userAPI.getAvatarBlob(avatarFilename)
        .then(setAvatarUrl)
        .catch(() => setImageError(true));
    }
  }, [avatarFilename, imageError]);

  const handleImageError = () => {
    setImageError(true);
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
  };

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt="Аватар пользователя"
        className="w-6 h-6 rounded-full object-cover"
        onError={handleImageError}
      />
    );
  }

  return (
    <div className="w-6 h-6 bg-brand-light rounded-full flex items-center justify-center">
      <span className="text-strong font-semibold text-sm">
        {firstName?.charAt(0)?.toUpperCase()}
      </span>
    </div>
  );
};

export default Avatar;
