export const columnStringToIndex = (input: string): number => {
  let result = 0;
  for (let i = 0; i < input.length; i++) {
    result = result * 26 + (input.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
};

export const columnIndexToString = (input: number): string => {
  if (input < 0) {
    throw new Error('Column index must be non-negative');
  }

  let result = '';
  let num = input + 1;

  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }

  return result;
};
