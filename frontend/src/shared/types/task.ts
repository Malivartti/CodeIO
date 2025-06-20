export enum TasksType {
  PUBLIC = 'public',
  PERSONAL = 'personal'
}

export enum DifficultyEnum {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum TaskStatusEnum {
  TODO = 'todo',
  ATTEMPTED = 'attempted',
  SOLVED = 'solved'
}

export enum SortByEnum {
  ID = 'id',
  DIFFICULTY = 'difficulty',
  ACCEPTANCE = 'acceptance'
}

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc'
}

export interface TaskPublicForList {
  id: number;
  title: string;
  difficulty: DifficultyEnum;
  acceptance: number;
  user_attempt_status?: TaskStatusEnum;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TasksPublic {
  data: TaskPublicForList[];
  count: number;
}

export interface TasksFilters {
  skip?: number;
  limit?: number;
  tasks_type: TasksType;
  search?: string;
  sort_by?: SortByEnum;
  sort_order?: SortOrderEnum;
  statuses?: TaskStatusEnum[];
  difficulties?: DifficultyEnum[];
  tag_ids?: number[];
}

export interface TaskApi {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyEnum;
  time_limit_seconds: number;
  memory_limit_megabytes: number;
  tests: string[][][];
  is_public: boolean;
  tag_ids: number[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyEnum;
  time_limit_seconds: number;
  memory_limit_megabytes: number;
  tests: TestCase[]
  is_public: boolean;
  tag_ids: number[];
}

export interface TaskCreateForm {
  title: string;
  description: string;
  difficulty: DifficultyEnum;
  time_limit_seconds: number;
  memory_limit_megabytes: number;
  tests: TestCase[];
  is_public: boolean;
  tag_ids: number[];
}

export interface TestCase {
  id: number;
  inputs: string[];
  outputs: string[];
}

export interface TaskCreate {
  title: string;
  description: string;
  difficulty: DifficultyEnum;
  time_limit_seconds: number;
  memory_limit_megabytes: number;
  tests: string[][][];
  is_public: boolean;
}

export type TaskUpdate = TaskCreate;

export interface TaskUpdateForm extends TaskCreateForm {
  id: number;
}

export const DIFFICULTY_COLORS: Record<DifficultyEnum, string> = {
  [DifficultyEnum.EASY]: 'text-success',
  [DifficultyEnum.MEDIUM]: 'text-warning',
  [DifficultyEnum.HARD]: 'text-error',
};

export const DIFFICULTY_LABELS: Record<DifficultyEnum, string> = {
  [DifficultyEnum.EASY]: 'Легкая',
  [DifficultyEnum.MEDIUM]: 'Средняя',
  [DifficultyEnum.HARD]: 'Сложная',
};

export const TASK_STORAGE_KEY = 'editor';
