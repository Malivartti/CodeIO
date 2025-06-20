import CrossIcon from '@shared/assets/icons/Cross.svg';
import { TestCase } from '@shared/types/task';
import React, { FC, useRef, useState } from 'react';

import TestCaseEditor from './TestCaseEditor';

interface Props {
  tests: TestCase[];
  onTestsChange: (tests: TestCase[]) => void;
}

const TestsSection: FC<Props> = ({ tests, onTestsChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const addTest = () => {
    const newTest: TestCase = {
      id: Date.now(),
      inputs: [],
      outputs: [],
    };
    onTestsChange([...tests, newTest]);
  };

  const updateTest = (index: number, testCase: TestCase) => {
    const updatedTests = tests.map((test, i) => (i === index ? testCase : test));
    onTestsChange(updatedTests);
  };

  const removeTest = (index: number) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    onTestsChange(updatedTests);
  };

  const parseTestsFromFile = (content: string): TestCase[] => {
    try {
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed)) {
        throw new Error('Неверный формат файла');
      }

      if (!parsed.length) {
        throw new Error('В файле нет тестов');
      }

      return parsed.map((test, index) => {
        if (!Array.isArray(test) || test.length !== 2) {
          throw new Error(`Неверный формат теста ${index + 1}`);
        }

        const [inputs, outputs] = test;

        if (!Array.isArray(inputs) || !Array.isArray(outputs)) {
          throw new Error(`Неверный формат теста ${index + 1}`);
        }

        return {
          id: Date.now(),
          inputs,
          outputs,
        };
      });
    } catch {
      throw new Error('Не удалось распарсить файл. Формат должен быть [[["1 строка ввода", "2 строка ввода"], ["1 строка вывод", "2 строка вывода"]]].');
    }
  };

  const handleImportTests = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const content = await file.text();
      const importedTests = parseTestsFromFile(content);
      onTestsChange([...tests, ...importedTests]);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Ошибка при импорте файла');
    }

    event.target.value = '';
  };

  const clearImportError = () => {
    setImportError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-medium text-strong">Тесты</h3>
        <div className="flex flex-row gap-2 xs:gap-2">
          <button
            type="button"
            onClick={handleImportTests}
            className="px-3 py-2 border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active text-strong rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Импортировать тесты
          </button>
          <button
            type="button"
            onClick={addTest}
            className="px-3 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Добавить тест
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {importError && (
        <div className="bg-canvas border border-error rounded-lg p-3 sm:p-4 flex items-start gap-3">
          <div className="text-error text-sm flex-1 min-w-0">
            <strong>Ошибка импорта:</strong> <span className="break-words">{importError}</span>
          </div>
          <button
            type="button"
            onClick={clearImportError}
            className="text-subtle hover:text-error transition-colors flex-shrink-0 p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 rounded"
            aria-label="Закрыть ошибку"
          >
            <CrossIcon width={20} height={20} />
          </button>
        </div>
      )}

      {tests.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-subtle">
          <p className="text-sm sm:text-base">Нет тестов. Добавьте тест или импортируйте из файла.</p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {tests.map((test, index) => (
          <TestCaseEditor
            key={test.id}
            testCase={test}
            onUpdate={(updatedTest) => updateTest(index, updatedTest)}
            onRemove={() => removeTest(index)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TestsSection;
