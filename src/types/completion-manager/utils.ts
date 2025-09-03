import { rawModelApi } from 'boot/axios';

import aw from 'assets/aw.json';
import { useSettingsStore } from 'stores/settings';

type ResponseUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type NonStreamingChoice = {
  finish_reason: string | null;
  native_finish_reason: string | null;
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type ErrorResponse = {
  code: number; // See "Error Handling" section
  message: string;
  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
};

type ToolCall = {
  id: string;
  type: 'function';
  function: never;
};
interface CompletionBody {
  id: string;
  choices: NonStreamingChoice[];
  created: number; // Unix timestamp
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  system_fingerprint?: string; // Only present if the provider supports it
  usage?: ResponseUsage;
}

export const generateRaw = async (content: string, signal: AbortSignal) => {
  const settingsStore = useSettingsStore();

  const { data } = await rawModelApi.post<CompletionBody>(
    '/chat/completions',
    {
      model: settingsStore.model,
      messages: [
        {
          role: 'system',
          content:
            '你现在是一个测试专家，我需要你参考当前测试用例表格的数据，并回答我要求的内容。' +
            `请首先将以下JSON格式的数据作为业务说明和相关命令介绍：\n${JSON.stringify(aw)}`,
        },
        {
          role: 'system',
          content:
            '之后，我将以JSON格式告诉你当前测试用例表格的相关数据，格式样例如下：\n' +
            '{\n' +
            '  "fileName": "用户管理系统网页功能测试.xlsx",\n' +
            '  "cells": {\n' +
            '    "current": { // 当前正在编辑的单元格数据\n' +
            '      "address": { // 单元格列序号和行序号（从0开始）\n' +
            '        "column": 14,\n' +
            '        "row": 7,\n' +
            '      },\n' +
            '      "content": "验证登录功能"\n' +
            '    },\n' +
            '    "relative": [ // 多个与当前单元格相邻的单元格数据\n' +
            '      {\n' +
            '        "address": {\n' +
            '          "column": 15,\n' +
            '          "row": 7,\n' +
            '        },\n' +
            '        "content": "输入正确的用户名和密码，点击登录按钮"\n' +
            '      },\n' +
            '      {\n' +
            '        "address": {\n' +
            '          "column": 16,\n' +
            '          "row": 7,\n' +
            '        },\n' +
            '        "content": "用户成功登录，没有报错"\n' +
            '      }\n' +
            '    ],\n' +
            '    "static": [ // 固定位置的单元格数据，一般为表格头信息\n' +
            '      {\n' +
            '        "address": {\n' +
            '          "column": 14,\n' +
            '          "row": 1,\n' +
            '        },\n' +
            '        "content": "测试用例名称"\n' +
            '      },\n' +
            '      {\n' +
            '        "address": {\n' +
            '          "column": 15,\n' +
            '          "row": 1,\n' +
            '        },\n' +
            '        "content": "测试步骤描述"\n' +
            '      },\n' +
            '      {\n' +
            '        "address": {\n' +
            '          "column": 16,\n' +
            '          "row": 1,\n' +
            '        },\n' +
            '        "content": "测试步骤预期结果"\n' +
            '      }\n' +
            '    ]\n' +
            '  }\n' +
            '}。以下是当前测试用例表格的相关数据：',
        },
        {
          role: 'user',
          content,
        },
        {
          role: 'system',
          content:
            '请你参考当前测试用例表格的相关数据，补全当前单元格的内容(current.content)，只需要给我补全的内容即可，不要返回其他多余文本。',
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${settingsStore.apiToken}`,
      },
      signal,
    },
  );
  return data.choices[0]?.message.content ?? '';
};
