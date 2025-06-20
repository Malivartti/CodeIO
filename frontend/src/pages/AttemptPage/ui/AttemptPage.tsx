import { attemptStore } from '@entities/attempt';
import { taskStore } from '@entities/task';
import ErrorPage from '@pages/ErrorPage';
import { AttemptStatus } from '@shared/types/attempt';
import { AppRoutes } from '@shared/types/routes';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AttemptCodeSection from './components/AttemptCodeSection';
import AttemptErrorSection from './components/AttemptErrorSection';
import AttemptHeader from './components/AttemptHeader';
import AttemptOutputSection from './components/AttemptOutputSection';
import AttemptResultsSection from './components/AttemptResultsSection';

const AttemptPage: FC = observer(() => {
  const navigate = useNavigate();
  const { id: attemptId } = useParams<{ id: string }>();

  useEffect(() => {
    if (attemptId) {
      const numericAttemptId = parseInt(attemptId);
      if (!isNaN(numericAttemptId)) {
        attemptStore.loadAttempt(numericAttemptId);
      } else {
        navigate(AppRoutes.NOT_FOUND, { replace: true });
      }
    }

    return () => {
      attemptStore.reset();
    };
  }, [attemptId, navigate]);

  useEffect(() => {
    if (attemptStore.attempt?.task_id) {
      taskStore.loadTask(attemptStore.attempt.task_id);
    }

    return () => {
      taskStore.reset();
    };
  }, [attemptStore.attempt?.task_id]);

  if (attemptStore.shouldNavigateToError) {
    return (
      <ErrorPage
        title={attemptStore.errorTitle}
        error={attemptStore.errorMessage}
        showRetry={attemptStore.showRetry}
        onRetry={() => attemptStore.retryLoadAttempt()}
      />
    );
  }

  if (attemptStore.isLoading) {
    return (
      <Container>
        <div className="text-center py-12 text-subtle">Загрузка попытки...</div>
      </Container>
    );
  }

  if (!attemptStore.attempt && !attemptStore.isLoading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="text-error text-lg mb-4">Не удалось загрузить попытку</div>
          <Link
            to={AppRoutes.TASKS}
            className="bg-brand hover:bg-brand-hover text-inverse px-4 py-2 rounded-md transition-colors"
          >
            К списку задач
          </Link>
        </div>
      </Container>
    );
  }

  const attempt = attemptStore.attempt!;

  return (
    <div className="pt-[56px] min-h-screen bg-canvas">
      <Container>
        <div className="py-6 space-y-6">
          <AttemptHeader
            attempt={attempt}
            task={taskStore.task}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <AttemptCodeSection attempt={attempt} />

              {attempt.status !== AttemptStatus.RUNNING && (
                <AttemptResultsSection attempt={attempt} />
              )}
            </div>

            <div className="space-y-6">
              {attempt.error_traceback && (
                <AttemptErrorSection
                  errorTraceback={attempt.error_traceback}
                  status={attempt.status}
                />
              )}

              {(attempt.source_code_output || attempt.expected_output) && (
                <AttemptOutputSection
                  sourceOutput={attempt.source_code_output}
                  expectedOutput={attempt.expected_output}
                  status={attempt.status}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
});

export default AttemptPage;
