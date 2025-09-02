import type { CompletionCandidate } from './types';
import { StatisticsData } from './types';

import type { ContentContext } from 'src/types/common';
import type { PromptElements } from 'src/types/completion-manager/types';

export class StatisticManager {
  private _dataMap = new Map<string, StatisticsData>();

  constructor() {
    setInterval(() => {
      for (const [id, data] of this._dataMap) {
        if (data.isExpired) {
          this.abort(id);
        }
      }
    });
  }

  abort(id: string) {
    return this._dataMap.delete(id);
  }

  begin(projectId: string) {
    const data = new StatisticsData(projectId);
    this._dataMap.set(data.id, data);
    return data.id;
  }

  setContext(id: string, context: ContentContext) {
    const data = this._dataMap.get(id);
    if (data) {
      data.context = context;
      return true;
    }
    return false;
  }

  setElements(id: string, elements: PromptElements) {
    const data = this._dataMap.get(id);
    if (data) {
      data.elements = elements;
      return true;
    }
    return false;
  }

  setCandidates(id: string, candidates: string[]) {
    const data = this._dataMap.get(id);
    if (data) {
      data.candidates = candidates;
      return true;
    }
    return false;
  }

  getCurrentCandidate(id: string): CompletionCandidate | undefined {
    const data = this._dataMap.get(id);
    if (data) {
      return data.currentCandidate();
    }
    return undefined;
  }

  getNextCandidate(id: string): CompletionCandidate | undefined {
    const data = this._dataMap.get(id);
    if (data) {
      return data.nextCandidate();
    }
    return undefined;
  }

  getPreviousCandidate(id: string): CompletionCandidate | undefined {
    const data = this._dataMap.get(id);
    if (data) {
      return data.previousCandidate();
    }
    return undefined;
  }

  accept(id: string) {
    const data = this._dataMap.get(id);
    if (data) {
      data.accept();
      return true;
    }
    return false;
  }
}
