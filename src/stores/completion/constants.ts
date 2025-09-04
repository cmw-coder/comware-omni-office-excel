import { CompletionStrategy, CompletionStrategyVersion } from 'src/types/common';

import type { CompletionStrategyDefinition } from './types';

export const COMPLETION_STRATEGY_DEFINITIONS: CompletionStrategyDefinition[] = [
  {
    strategy: CompletionStrategy.testCase,
    features: [
      {
        version: CompletionStrategyVersion.v1,
        detectRangeAddress: 'A1:AV1',
        detectCellDataList: [
          {
            address: {
              column: 0,
              row: 0,
            },
            content: '一级模块系统编号',
          },
          {
            address: {
              column: 1,
              row: 0,
            },
            content: '一级模块名称',
          },
          {
            address: {
              column: 2,
              row: 0,
            },
            content: '二级模块系统编号',
          },
          {
            address: {
              column: 3,
              row: 0,
            },
            content: '二级模块名称',
          },
          {
            address: {
              column: 4,
              row: 0,
            },
            content: '三级模块系统编号',
          },
          {
            address: {
              column: 5,
              row: 0,
            },
            content: '三级模块名称',
          },
          {
            address: {
              column: 6,
              row: 0,
            },
            content: '四级模块系统编号',
          },
          {
            address: {
              column: 7,
              row: 0,
            },
            content: '四级模块名称',
          },
          {
            address: {
              column: 8,
              row: 0,
            },
            content: '五级模块系统编号',
          },
          {
            address: {
              column: 9,
              row: 0,
            },
            content: '五级模块名称',
          },
          {
            address: {
              column: 10,
              row: 0,
            },
            content: '其他模块系统编号',
          },
          {
            address: {
              column: 11,
              row: 0,
            },
            content: '其他模块名称',
          },
          {
            address: {
              column: 12,
              row: 0,
            },
            content: '测试用例系统编号',
          },
          {
            address: {
              column: 13,
              row: 0,
            },
            content: '测试用例序号',
          },
          {
            address: {
              column: 14,
              row: 0,
            },
            content: '测试用例名称',
          },
          {
            address: {
              column: 15,
              row: 0,
            },
            content: '测试步骤描述',
          },
          {
            address: {
              column: 16,
              row: 0,
            },
            content: '测试步骤预期结果',
          },
          {
            address: {
              column: 17,
              row: 0,
            },
            content: '测试类型',
          },
          {
            address: {
              column: 18,
              row: 0,
            },
            content: '测试用例级别',
          },
          {
            address: {
              column: 19,
              row: 0,
            },
            content: '执行方式',
          },
          {
            address: {
              column: 20,
              row: 0,
            },
            content: '自动化状态',
          },
          {
            address: {
              column: 21,
              row: 0,
            },
            content: '入库时间',
          },
          {
            address: {
              column: 22,
              row: 0,
            },
            content: '测试用例说明',
          },
          {
            address: {
              column: 23,
              row: 0,
            },
            content: '前置条件',
          },
          {
            address: {
              column: 24,
              row: 0,
            },
            content: '维护人',
          },
          {
            address: {
              column: 25,
              row: 0,
            },
            content: '标签',
          },
          {
            address: {
              column: 26,
              row: 0,
            },
            content: '备注',
          },
          {
            address: {
              column: 27,
              row: 0,
            },
            content: '主测命令',
          },
          {
            address: {
              column: 28,
              row: 0,
            },
            content: '原子功能',
          },
          {
            address: {
              column: 29,
              row: 0,
            },
            content: '主测设计维护',
          },
          {
            address: {
              column: 30,
              row: 0,
            },
            content: '辅测命令',
          },
          {
            address: {
              column: 31,
              row: 0,
            },
            content: '自动化检查维护',
          },
          {
            address: {
              column: 32,
              row: 0,
            },
            content: '设计来源',
          },
          {
            address: {
              column: 33,
              row: 0,
            },
            content: '来源编号',
          },
          {
            address: {
              column: 34,
              row: 0,
            },
            content: 'B75脚本',
          },
          {
            address: {
              column: 35,
              row: 0,
            },
            content: 'V9脚本',
          },
          {
            address: {
              column: 36,
              row: 0,
            },
            content: 'B64脚本',
          },
          {
            address: {
              column: 37,
              row: 0,
            },
            content: 'B70脚本',
          },
          {
            address: {
              column: 38,
              row: 0,
            },
            content: '模块代码文件说明',
          },
          {
            address: {
              column: 39,
              row: 0,
            },
            content: '归档库',
          },
          {
            address: {
              column: 40,
              row: 0,
            },
            content: '项目NVID',
          },
          {
            address: {
              column: 41,
              row: 0,
            },
            content: '是否同步到正式库',
          },
          {
            address: {
              column: 42,
              row: 0,
            },
            content: '最新执行时间',
          },
          {
            address: {
              column: 43,
              row: 0,
            },
            content: '最新执行结果',
          },
          {
            address: {
              column: 44,
              row: 0,
            },
            content: '最新执行人',
          },
          {
            address: {
              column: 45,
              row: 0,
            },
            content: '所属执行任务',
          },
          {
            address: {
              column: 46,
              row: 0,
            },
            content: '最新执行方式',
          },
          {
            address: {
              column: 47,
              row: 0,
            },
            content: '作者',
          },
        ],
        staticRangeAddress: 'A1:S1',
      },
    ],
  },
];
