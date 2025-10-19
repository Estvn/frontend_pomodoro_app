export const formatTimeForHome = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatTimeDetailed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
};

export const formatDate = (date?: string | Date | null) => {
  if (!date) return '';
  const d = new Date(date as any);
  return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES');
};
