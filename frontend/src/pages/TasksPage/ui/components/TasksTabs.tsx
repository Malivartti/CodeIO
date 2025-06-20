import { TasksType } from '@shared/types/task';
import { FC } from 'react';

interface TasksTabsProps {
  activeTab: TasksType;
  onTabChange: (tab: TasksType) => void;
}

const TasksTabs: FC<TasksTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: TasksType.PUBLIC,
      label: 'Все задачи',
    },
    {
      id: TasksType.PERSONAL,
      label: 'Мои задачи',
    },
  ];

  return (
    <div className="border-b border-surface">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-brand text-brand'
                : 'border-transparent text-medium hover:text-strong hover:border-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TasksTabs;
