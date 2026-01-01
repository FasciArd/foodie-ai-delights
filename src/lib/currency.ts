// Pakistani Rupee formatting utility
export const formatPKR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'Rs. 0';
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatPKRCompact = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'Rs. 0';
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }
  return formatPKR(amount);
};
