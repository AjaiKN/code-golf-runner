export const getHumanTime = (timestamp: string | Date) =>
  new Date(timestamp).toLocaleTimeString()
