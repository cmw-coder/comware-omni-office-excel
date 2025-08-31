import { rawModelApi } from 'boot/axios';

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

export const generate = async (content: string, signal: AbortSignal) => {
  const settingsStore = useSettingsStore();

  const { data } = await rawModelApi.post<CompletionBody>(
    '/chat/completions',
    {
      model: settingsStore.model,
      messages: [
        {
          role: 'system',
          content: '你现在是一个测试专家，我需要你参考当前测试用例表格的数据，并回答我要求的内容。',
        },
        {
          role: 'system',
          content: '我将以JSON格式告诉你当前测试用例表格的相关数据，格式样例如下：\n' +
            '{\n' +
            '  "current": {\n' +
            '    "address": "A2", // 当前正在编辑的单元格位置\n' +
            '    "content": "登录功能测试"\n' +
            '  },\n' +
            '  "relative": [ // 多个相对位置的单元格数据\n' +
            '    {\n' +
            '      "address": "B2", // 单元格地址\n' +
            '      "dx": 1, // 相对于当前单元格的列偏移量\n' +
            '      "dy": 0, // 相对于当前单元格的行偏移量\n' +
            '      "content": "输入正确的用户名和密码，点击登录按钮"\n' +
            '    }\n' +
            '  ],\n' +
            '  "static": [ // 多个静态位置的单元格数据\n' +
            '    {\n' +
            '      "address": "A1", // 单元格地址\n' +
            '      "content": "测试用例名称"\n' +
            '    },\n' +
            '    {\n' +
            '      "address": "B1", // 单元格地址\n' +
            '      "content": "测试步骤描述"\n' +
            '    }\n' +
            '  ]\n' +
            '}。',
        },
        {
          role: 'user',
          content,
        },
        {
          role: 'system',
          content: '请你补全当前正在编辑的单元格的内容(current.content)，只需要给我补全的内容即可，不要返回其他多余文本。',
        }
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
