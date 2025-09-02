export const columnStringToIndex = (input: string): number => {
  let result = 0;
  for (let index = 0; index < input.length; index++) {
    result = result * 26 + (input.charCodeAt(index) - 64);
  }
  return result - 1;
};

export const columnIndexToString = (input: number): string => {
  let result = '';
  while (input > 0) {
    input--;
    result = String.fromCharCode('A'.charCodeAt(0) + (input % 26)) + result;
    input = Math.floor(input / 26);
  }
  return result;
};

export const parseCellAddressString = (address: string) => {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match?.[1] || !match?.[2]) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  const col = columnStringToIndex(match[1]);
  const row = parseInt(match[2], 10);
  if (isNaN(col) || isNaN(row)) {
    throw new Error(`Invalid cell address: ${address}`);
  }
  return { col, row };
}

export const parseRangeAddressString = (address: string) => {
  const match = address.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid range address: ${address}`);
  }
  const startCol = columnStringToIndex(match[1]);
  const startRow = parseInt(match[2], 10);
  const endCol = columnStringToIndex(match[3]);
  const endRow = parseInt(match[4], 10);
  return {
    startCol,
    startRow,
    endCol,
    endRow,
  };
}
