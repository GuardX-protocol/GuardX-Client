export const MIN_DEPOSIT_WEI = BigInt('1000000');
export const MIN_DEPOSIT_USD = 1;

export const getMinimumDeposit = (decimals: number): bigint => {
  return MIN_DEPOSIT_WEI;
};

export const formatMinimumDeposit = (decimals: number): string => {
  if (decimals === 18) {
    return '0.000001';
  }
  if (decimals === 6) {
    return '1';
  }
  if (decimals === 8) {
    return '0.01';
  }
  return '1';
};

export const getMinimumDepositUSD = (): number => {
  return MIN_DEPOSIT_USD;
};