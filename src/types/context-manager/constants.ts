import { MAX_ROW_COUNT } from 'src/types/office-helper/constants';
import { columnStringToIndex } from 'src/utils/excel';

export const TEST_CASE_CONFIGS = {
  v1: {
    indexingColumns: ['B', 'D', 'F', 'H', 'J', 'L', 'N'],
    dataRange: {
      begin: {
        column: columnStringToIndex('O'),
        row: 2,
      },
      end: {
        column: columnStringToIndex('S'),
        row: MAX_ROW_COUNT,
      },
    },
  },
};
