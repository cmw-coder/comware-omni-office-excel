import { isCancel } from 'axios';

import { useSettingsStore } from 'stores/settings';

import { COMPLETION_FUNCTION_MAP } from './constants';
import { GenerateResult, LRUCache } from './types/common';
import type { GenerateResponse, PromptElements } from './types/common';

export class CompletionManager {
  private _abortController?: AbortController;
  private _cache = new LRUCache<string[]>(100);

  async generate(promptElements: PromptElements, noCache = false): Promise<GenerateResponse> {
    const cacheKey = promptElements.cacheKey;

    if (!noCache) {
      const completionCached = this._cache.get(cacheKey);
      if (completionCached) {
        return {
          result: GenerateResult.success,
          data: completionCached,
        };
      }
    }

    this._abortController?.abort();
    this._abortController = new AbortController();

    try {
      const result = await COMPLETION_FUNCTION_MAP[useSettingsStore().networkZone](
        promptElements,
        this._abortController.signal,
      );
      if (result?.length) {
        this._cache.put(cacheKey, [result]);
        return {
          result: GenerateResult.success,
          data: [result],
        };
      }
      return {
        result: GenerateResult.empty,
        data: [],
      };
    } catch (e) {
      this._abortController = new AbortController();
      if (isCancel(e)) {
        return {
          result: GenerateResult.cancel,
          data: [],
        };
      }
      console.error(e);
      return {
        result: GenerateResult.error,
        data: [(<Error>e).message],
      };
    }
  }
}
