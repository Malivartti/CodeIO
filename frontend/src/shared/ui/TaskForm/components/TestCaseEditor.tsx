import { TestCase } from '@shared/types/task';
import { FC } from 'react';

interface Props {
  testCase: TestCase;
  onUpdate: (testCase: TestCase) => void;
  onRemove: () => void;
  index: number;
}

const TestCaseEditor: FC<Props> = ({ testCase, onUpdate, onRemove, index }) => {
  const handleInputChange = (value: string) => {
    const inputs = value.split('\n');
    onUpdate({ ...testCase, inputs });
  };

  const handleOutputChange = (value: string) => {
    const outputs = value.split('\n');
    onUpdate({ ...testCase, outputs });
  };

  return (
    <div className="border border-surface rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-surface">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-strong text-sm sm:text-base">Тест {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-error hover:text-error-hover active:text-error-active text-sm font-medium px-2 py-1 -m-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
        >
          Удалить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label
            htmlFor={`test-${index}-input`}
            className="block text-sm font-medium text-strong"
          >
            Входные данные
          </label>
          <textarea
            id={`test-${index}-input`}
            className="w-full p-3 border border-surface rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-strong bg-canvas transition-colors text-sm sm:text-base"
            style={{ whiteSpace: 'pre-wrap' }}
            placeholder="Введите входные данные..."
            value={testCase.inputs.join('\n')}
            onChange={(e) => handleInputChange(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`test-${index}-output`}
            className="block text-sm font-medium text-strong"
          >
            Ожидаемый вывод
          </label>
          <textarea
            id={`test-${index}-output`}
            className="w-full p-3 border border-surface rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-strong bg-canvas transition-colors text-sm sm:text-base"
            style={{ whiteSpace: 'pre-wrap' }}
            placeholder="Введите ожидаемый результат..."
            value={testCase.outputs.join('\n')}
            onChange={(e) => handleOutputChange(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCaseEditor;
