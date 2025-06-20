export const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms} мс`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(3)} сек`;
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)} мин`;
};

export const formatMemory = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} байт`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} КБ`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} МБ`;
};
