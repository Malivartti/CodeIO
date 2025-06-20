import { AppRoutes } from '@shared/types/routes';
import { TasksType } from '@shared/types/task';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface TasksHeaderProps {
  activeTab: TasksType;
  isAuth: boolean;
}

const TasksHeader: FC<TasksHeaderProps> = ({ activeTab, isAuth }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-strong leading-loose">Задачи</h1>

      {isAuth && activeTab === TasksType.PERSONAL && (
        <Link to={AppRoutes.TASK_CREATE} className="px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors">
          Создать задачу
        </Link>
      )}
    </div>
  );
};

export default TasksHeader;
