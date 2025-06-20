import { AttemptStatus } from '@shared/types/attempt';
import { FC } from 'react';

interface Props {
  sourceOutput?: string | null;
  expectedOutput?: string | null;
  status: AttemptStatus;
}

const AttemptOutputSection: FC<Props> = ({ sourceOutput, expectedOutput, status }) => {
  return (
    <div className="bg-elevated rounded-xl">
      <div className="p-4 border-b border-surface">
        <h3 className="text-lg font-medium text-strong">Вывод программы</h3>
      </div>

      <div className="p-4 space-y-4">
        {sourceOutput && (
          <div>
            <div className="text-sm text-subtle mb-2">Фактический вывод:</div>
            <pre className="bg-surface rounded-lg p-3 text-sm text-strong font-mono overflow-x-auto whitespace-pre-wrap break-words">
              {sourceOutput}
            </pre>
          </div>
        )}

        {expectedOutput && status === AttemptStatus.WRONG_ANSWER && (
          <div>
            <div className="text-sm text-subtle mb-2">Ожидаемый вывод:</div>
            <pre className="bg-surface rounded-lg p-3 text-sm text-success font-mono overflow-x-auto whitespace-pre-wrap break-words">
              {expectedOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptOutputSection;
