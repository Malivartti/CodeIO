export type BuildMode = 'production' | 'development';

export interface BuildPaths {
  root: string;
  entry: string;
  src: string;
  html: string;
  build: string;
  publicPath: string;
}

export interface BuildOptions {
  mode: BuildMode;
  paths: BuildPaths;
  isDev: boolean;
  port: number;
}

export interface BuildArgv {
  mode: BuildMode;
  port: number;
  publicPath: string;
}
