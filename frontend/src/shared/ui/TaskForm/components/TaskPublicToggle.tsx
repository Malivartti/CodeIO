import TickIcon from '@shared/assets/icons/Tick.svg';
import { default as cn } from 'classnames';
import { FC } from 'react';

interface Props {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  className?: string;
}

const TaskPublicToggle: FC<Props> = ({ isPublic, onChange, className }) => {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="relative">
        <input
          type="checkbox"
          id="is_public"
          checked={isPublic}
          onChange={(e) => onChange(e.target.checked)}
          className="
            peer
            appearance-none
            w-6 h-6
            border-2 border-surface
            rounded-md
            bg-canvas
            cursor-pointer
            transition-all duration-200 ease-in-out
            hover:border-surface-accent
            focus:outline-none
            focus:ring-2
            focus:ring-surface-accent
            focus:ring-opacity-50
            checked:bg-surface-accent
            checked:border-surface-accent
          "
        />
        <div className="
          absolute inset-0
          flex items-center justify-center
          pointer-events-none
          opacity-0
          peer-checked:opacity-100
          transition-opacity duration-200 ease-in-out
        ">
          <TickIcon className="text-medium" width={16} height={16} />
        </div>
      </div>
      <label
        htmlFor="is_public"
        className="text-sm text-strong cursor-pointer hover:text-medium transition-colors duration-200"
      >
        Публичная задача
      </label>
    </div>
  );
};

export default TaskPublicToggle;
