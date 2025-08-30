import { DateTime } from 'luxon'
import { uid } from 'quasar'

import { acceptSku, generateSku } from './utils'

import { NEW_LINE_REGEX } from 'src/constants/common'
import type { ContentContext } from 'src/types/common'
import type { PromptElements } from 'src/types/CompletionManager/types'

export interface CompletionCandidate {
  index: number
  content: string
}

export interface ReportSkuDto {
  begin?: number
  end?: number
  count: number
  type: 'AIGC'
  product: 'WORD'
  firstClass: 'CODE'
  secondClass: string
  skuName: 'ADOPT' | 'GENE' | 'KEEP'
  user: string
  userType: 'USER' | 'HOST'
  extra?: string
  subType?: string
  hostName?: string
}

export class StatisticsData {
  readonly id: string
  readonly projectId: string

  private _checkedIndexes = new Set<number>()
  private _lastCheckedIndex: number = -1
  private _candidates?: string[]
  private _context?: ContentContext
  private _elements?: PromptElements
  private _timestamps: {
    begin: DateTime
    candidates: DateTime
    context: DateTime
    elements: DateTime
  }

  constructor(projectId: string) {
    this.projectId = projectId
    this.id = uid()
    this._timestamps = {
      begin: DateTime.now(),
      candidates: DateTime.invalid('Uninitialized'),
      context: DateTime.invalid('Uninitialized'),
      elements: DateTime.invalid('Uninitialized'),
    }
  }

  get isExpired(): boolean {
    return DateTime.now().diff(this._timestamps.begin).as('minutes') > 30
  }

  set context(context: ContentContext) {
    this._timestamps.context = DateTime.now()
    this._context = context
  }

  set elements(elements: PromptElements) {
    this._timestamps.elements = DateTime.now()
    this._elements = elements
  }

  set candidates(candidates: string[]) {
    this._timestamps.candidates = DateTime.now()
    this._candidates = candidates
    if (candidates.length) {
      this._checkedIndexes.add(0)
      this._lastCheckedIndex = 0

      generateSku(
        this._timestamps.begin,
        this.currentCandidate()?.content.split(NEW_LINE_REGEX).length,
        'CMW',
        this.projectId,
      ).catch(console.error)
    }
  }

  currentCandidate(): CompletionCandidate | undefined {
    if (!this._candidates) {
      return undefined
    }

    const content = this._candidates[this._lastCheckedIndex]
    return content ? { index: this._lastCheckedIndex, content } : undefined
  }

  nextCandidate(): CompletionCandidate | undefined {
    if (!this._candidates) {
      return undefined
    }

    const index =
      this._lastCheckedIndex >= this._candidates.length - 1 ? 0 : this._lastCheckedIndex + 1

    return this._validateCandidate(index, this._candidates[index])
  }

  previousCandidate(): CompletionCandidate | undefined {
    if (!this._candidates) {
      return undefined
    }

    const index =
      this._lastCheckedIndex <= 0 ? this._candidates.length - 1 : this._lastCheckedIndex - 1

    return this._validateCandidate(index, this._candidates[index])
  }

  accept() {
    acceptSku(
      this._timestamps.begin,
      this.currentCandidate()?.content.split(NEW_LINE_REGEX).length,
      'CMW',
      this.projectId,
    ).catch(console.error)
  }

  private _validateCandidate(index: number, content?: string): CompletionCandidate | undefined {
    if (!content) {
      return undefined
    }

    if (!this._checkedIndexes.has(index)) {
      this._checkedIndexes.add(index)

      generateSku(
        this._timestamps.begin,
        content.split(NEW_LINE_REGEX).length,
        'CMW',
        this.projectId,
      ).catch(console.error)
    }
    this._lastCheckedIndex = index
    return { index, content }
  }
}
