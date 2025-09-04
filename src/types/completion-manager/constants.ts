import { NetworkZone } from 'src/types/common';
import { completionPublic, completionYellow } from 'src/types/completion-manager/utils/network';
import type { PromptElements } from 'src/types/completion-manager/types/common';

export const COMPLETION_FUNCTION_MAP: Record<
  NetworkZone,
  (promptElements: PromptElements, signal: AbortSignal) => Promise<string>
> = {
  [NetworkZone.Red]: () => Promise.reject(new Error('Not implemented')),
  [NetworkZone.Route]: () => Promise.reject(new Error('Not implemented')),
  [NetworkZone.Yellow]: completionYellow,
  [NetworkZone.Public]: completionPublic,
};
