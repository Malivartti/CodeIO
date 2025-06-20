export enum AttemptStatus {
  RUNNING = 'Running',
  OK = 'Ok',
  WRONG_ANSWER = 'Wrong answer',
  COMPILATION_ERROR = 'Compilation error',
  RUNTIME_ERROR = 'Run-time error',
  TIME_LIMIT_EXCEEDED = 'Time-limit exceeded',
  MEMORY_LIMIT_EXCEEDED = 'Memory limit exceeded',
  OUTPUT_LIMIT_EXCEEDED = 'Output limit exceeded'
}

export enum ProgrammingLanguage {
  PYTHON = 'Python',
  GO = 'Go',
  JAVASCRIPT = 'JavaScript',
  CPP = 'C++',
  C = 'C',
  C_SHARP = 'C#',
  RUST = 'Rust',
  JAVA = 'Java',
  KOTLIN = 'Kotlin'
}

export interface AttemptCreate {
  user_id: string;
  task_id: number;
  programming_language: ProgrammingLanguage;
  source_code: string;
}

export interface AttemptForListPublic {
  id: number;
  status: AttemptStatus;
  programming_language: ProgrammingLanguage;
  time_used_ms: number;
  memory_used_bytes: number;
  failed_test_number: number | undefined;
  created_at: string;
}

export interface Attempt {
  id: number;
  user_id: string;
  task_id: number;
  programming_language: ProgrammingLanguage;
  source_code: string;
  status: AttemptStatus;
  time_used_ms: number;
  memory_used_bytes: number;
  error_traceback: string | null;
  failed_test_number: number | null;
  source_code_output: string | null;
  expected_output: string | null;
  created_at: string;
}

export interface AttemptsResponse {
  data: AttemptForListPublic[];
  count: number;
}


export interface AttemptPublic {
  id: number;
  user_id: string;
  task_id: number;
  programming_language: ProgrammingLanguage;
  source_code: string;
  status: AttemptStatus;
  time_used_ms: number;
  memory_used_bytes: number;
  error_traceback: string | null;
  failed_test_number: number | null;
  source_code_output: string | null;
  expected_output: string | null;
  created_at: string;
}
