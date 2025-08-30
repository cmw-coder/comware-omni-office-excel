import { rawModelApi } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';

export const digestMessage = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

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

  console.log(settingsStore.apiToken, settingsStore.model);

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
          role: 'user',
          content: content,
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
