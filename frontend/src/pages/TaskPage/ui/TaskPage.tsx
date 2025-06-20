import { attemptsStore } from '@entities/attempt';
import { taskStore } from '@entities/task';
import { userStore } from '@entities/user';
import ErrorPage from '@pages/ErrorPage';
import { useLocalStorage } from '@shared/hooks/useLocalStorage';
import { ProgrammingLanguage } from '@shared/types/attempt';
import ResizableSplitPane from '@shared/ui/ResizableSplitPane';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import AttemptsTable from './components/AttemptsTable';
import TaskEditorSection from './components/TaskEditorSection';
import TaskInfoSection from './components/TaskInfoSection';

const TaskPage: FC = observer(() => {
  const { id: taskId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useLocalStorage<'task' | 'editor'>('taskPage_activeTab', 'task');
  const [defaultLeftWidth, setDefaultLeftWidth] = useLocalStorage('taskPage_leftWidth', 50);

  const [currentTaskId, setCurrentTaskId] = useLocalStorage<string | null>('current_task_id', null);
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<ProgrammingLanguage>(
    'current_task_language',
    ProgrammingLanguage.PYTHON
  );
  const [sourceCode, setSourceCode] = useLocalStorage<string>(
    'current_task_sourceCode',
    ''
  );

  const isAuthorized = userStore.isAuthenticated;

  useEffect(() => {
    if (taskId && taskId !== currentTaskId) {
      setSourceCode('');
      setSelectedLanguage(ProgrammingLanguage.PYTHON);
      setCurrentTaskId(taskId);
    }
  }, [taskId, currentTaskId, setSourceCode, setSelectedLanguage, setCurrentTaskId]);

  useEffect(() => {
    if (taskId) {
      const numericTaskId = parseInt(taskId);
      if (!isNaN(numericTaskId)) {
        taskStore.loadTask(numericTaskId);

        if (isAuthorized) {
          attemptsStore.loadAttempts(numericTaskId);
        }
      }
    }

    return () => {
      taskStore.reset();
      attemptsStore.reset();
    };
  }, [taskId, isAuthorized]);

  const handleSubmitSolution = useCallback(async () => {
    if (!taskId) return;

    await attemptsStore.submitAttempt(
      parseInt(taskId),
      selectedLanguage,
      sourceCode
    );
  }, [taskId, selectedLanguage, sourceCode]);

  const handlePageChange = useCallback((newPage: number) => {
    if (taskId) {
      attemptsStore.loadAttempts(parseInt(taskId), newPage);
    }
  }, [taskId]);

  const handleClearError = useCallback(() => {
    attemptsStore.clearError();
  }, []);

  const hasAttempts = useMemo(() => attemptsStore.attempts.length > 0, [attemptsStore.attempts]);
  const numericTaskId = useMemo(() => taskId ? parseInt(taskId) : 0, [taskId]);

  if (taskStore.shouldNavigateToError) {
    return (
      <ErrorPage
        title={taskStore.errorTitle}
        error={taskStore.errorMessage}
        showRetry={taskStore.showRetry}
        onRetry={() => taskStore.retryLoadTask()}
      />
    );
  }

  if (taskStore.isLoading) {
    return (
      <Container>
        <div className="text-center py-12">Загрузка...</div>
      </Container>
    );
  }

  if (!taskStore.task && !taskStore.isLoading) {
    return (
      <Container>
        <div className="text-center py-12 text-error">Не удалось загрузить задачу</div>
      </Container>
    );
  }

  const renderTaskContent = () => (
    <div className="p-3 sm:p-4 lg:p-6 h-full overflow-auto">
      <TaskInfoSection
        task={taskStore.task}
        isSolved={attemptsStore.isSolved}
        hasAttempts={hasAttempts}
      />
    </div>
  );

  const renderEditorContent = () => (
    <div className="p-3 sm:p-4 lg:p-6 h-full overflow-auto">
      <TaskEditorSection
        taskId={numericTaskId}
        isAuthorized={isAuthorized}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        sourceCode={sourceCode}
        onSourceCodeChange={setSourceCode}
        onSubmit={handleSubmitSolution}
        isSubmitting={attemptsStore.isSubmitting}
        error={attemptsStore.error}
        onClearError={handleClearError}
      />
      {isAuthorized && (
        <div className="rounded-xl flex flex-col mt-4 lg:mt-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h2 className="text-lg font-medium text-strong">История попыток</h2>
            {attemptsStore.hasRunningAttempt && (
              <div className="flex items-center space-x-2 text-sm text-subtle">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                <span>Решение выполняется...</span>
              </div>
            )}
          </div>
          <div className="overflow-auto">
            <AttemptsTable
              attempts={attemptsStore.attempts}
              currentPage={attemptsStore.currentPage}
              totalItems={attemptsStore.totalAttempts}
              itemsPerPage={7}
              onPageChange={handlePageChange}
              isLoading={attemptsStore.isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-[56px] min-h-screen">
      <div className="block md:hidden h-[calc(100vh-56px)]">
        <div className="bg-surface border-b border-surface flex">
          <button
            onClick={() => setActiveTab('task')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'task'
                ? 'text-brand border-b-2 border-brand bg-surface-hover'
                : 'text-medium hover:text-strong hover:bg-surface-hover'
            }`}
          >
            Условие
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'editor'
                ? 'text-brand border-b-2 border-brand bg-surface-hover'
                : 'text-medium hover:text-strong hover:bg-surface-hover'
            }`}
          >
            Решение
          </button>
        </div>

        <div className="h-[calc(100%-48px)]">
          {activeTab === 'task' ? renderTaskContent() : renderEditorContent()}
        </div>
      </div>

      <div className="hidden md:block">
        <ResizableSplitPane
          left={renderTaskContent()}
          right={renderEditorContent()}
          leftWidth={defaultLeftWidth}
          onLeftWidthChange={setDefaultLeftWidth}
          minWidth={30}
          maxWidth={70}
        />
      </div>
    </div>
  );
});

export default TaskPage;
