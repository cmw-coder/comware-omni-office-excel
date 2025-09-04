import { isCancel } from 'axios';

import { generateRaw } from './utils/network';
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
          result: GenerateResult.Success,
          data: completionCached,
        };
      }
    }

    this._abortController?.abort();
    this._abortController = new AbortController();

    try {
      const result = await generateRaw(promptElements.stringify(), this._abortController.signal);
      if (result?.length) {
        this._cache.put(cacheKey, [result]);
        return {
          result: GenerateResult.Success,
          data: [result],
        };
      }
      return {
        result: GenerateResult.Empty,
        data: [],
      };
    } catch (e) {
      if (isCancel(e)) {
        return {
          result: GenerateResult.Cancel,
          data: [],
        };
      }
      console.error(e);
      return {
        result: GenerateResult.Error,
        data: [(<Error>e).message],
      };
    }
  }
}
