/**
 * Utility functions for managing seasonal services
 */

export const isSnowRemovalSeason = (): boolean => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (0 = January)
  
  // Snow removal season: November (10) through March (2)
  return month >= 10 || month <= 2;
};

export const getSnowRemovalSeasonDates = (): { start: string; end: string } => {
  const currentYear = new Date().getFullYear();
  
  return {
    start: `November 1, ${currentYear}`,
    end: `March 31, ${currentYear + 1}`
  };
};
