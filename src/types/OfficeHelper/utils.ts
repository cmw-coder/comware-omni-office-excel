export const columnStringToNumber = (input: string): number => {
  let result = 0;
  for (let i = 0; i < input.length; i++) {
    result = result * 26 + (input.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
};

export const columnNumberToString = (input: number): string => {
  let result = '';
  while (input > 0) {
    input--;
    result = String.fromCharCode('A'.charCodeAt(0) + (input % 26)) + result;
    input = Math.floor(input / 26);
  }
  return result;
};
