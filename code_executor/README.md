# Code Executor
Песочница-исполнитель, которая компилирует / запускает решения на разных языках
и проверяет их на наборе тестов.

## Основные возможности
- Поддержка компилируемых и интерпретируемых языков
  (Python, C++, Go, JavaScript, Rust, C, Java, Kotlin, C# — конфиг расширяется в `config.py`).
- Изолированный запуск решений:
  - жёсткие лимиты CPU, памяти и размера вывода;
  - принудительное завершение при выходе за рамки ограничений.
- Детализированные статусы (`ExecutionStatus`):
  `OK`, `WRONG_ANSWER`, `COMPILATION_ERROR`,
  `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`,
  `RUNTIME_ERROR`, `OUTPUT_LIMIT_EXCEEDED`.
- Параллельный запуск тестов через.

## Структура проекта
```
app/
├── executor.py        # запуск и контроль всего процесса решения
├── runner.py          # запуск команд в подпроцессе
├── process_monitor.py # контроль времени и памяти
├── config.py          # лимиты и шаблоны компиляции/запуска
├── enums.py           # статусы и языки программирования
├── models.py          # структуры Attempt, AttemptExecutionResult
└── tests/             # pytest-тесты
```

### Поток управления
1. `AttemptExecutor.execute()`
   записывает исходник во временную папку, компилирует (если нужно),
   затем последовательно запускает тесты.
2. Для каждого запуска создаётся `CommandRunner`, который
   - создает подпроцесс с нужными лимитами (`_set_limits`)
   - параллельно запускает `ProcessMonitor` для контроля RSS и времени.
3. По завершении собирается `RunResult`, который преобразуется
   в `AttemptExecutionResult` и возвращается в вызывающий код.


## Установка зависимостей
```
uv sync
```

## Быстрый старт
```python
from app.executor import AttemptExecutor
from app.enums import ProgrammingLanguage

attempt = Attempt(
    id=1,
    programming_language=ProgrammingLanguage.PYTHON,
    source_code="print(input()[::-1])",
    time_limit_seconds=1,
    memory_limit_megabytes=64,
    tests=[[["hello"], ["olleh"]]],
)

result = AttemptExecutor(attempt).execute()
print(result.status)         # -> ExecutionStatus.OK
```

## Запуск тестов
```bash
uv run pytest -n auto         # параллельный запуск
```
