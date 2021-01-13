/** Display time in a human-readable format */
export const getHumanTime = (timestamp: string | Date) =>
  new Date(timestamp).toLocaleTimeString()
