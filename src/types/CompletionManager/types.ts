import type { ContentContext } from 'src/types/common'

class ListNode<T> {
  public prev: ListNode<T> | null = null
  public next: ListNode<T> | null = null

  constructor(
    public key: string,
    public value: T,
  ) {}
}

export class LRUCache<T> {
  private readonly _capacity: number
  private _cache: Map<string, ListNode<T>> = new Map()
  private _head: ListNode<T> | null = null
  private _tail: ListNode<T> | null = null

  constructor(capacity: number) {
    this._capacity = capacity
  }

  public get(key: string): T | undefined {
    const node = this._cache.get(key)
    if (!node) {
      return undefined
    }
    this._removeNode(node)
    this._addToHead(node)
    return node.value
  }

  public put(key: string, value: T) {
    const node = this._cache.get(key)
    if (node) {
      node.value = value
      this._removeNode(node)
      this._addToHead(node)
    } else {
      const newNode = new ListNode(key, value)
      this._cache.set(key, newNode)
      this._addToHead(newNode)
      if (this._cache.size > this._capacity) {
        const tail = this._tail
        if (!tail) {
          return
        }
        this._cache.delete(tail.key)
        this._removeNode(tail)
      }
    }
  }

  private _removeNode(node: ListNode<T>) {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this._head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this._tail = node.prev
    }
  }

  private _addToHead(node: ListNode<T>) {
    if (this._head) {
      this._head.prev = node
      node.next = this._head
      this._head = node
    } else {
      this._head = node
      this._tail = node
    }
  }
}

export enum GenerateResult {
  Cancel = 'Cancel',
  Empty = 'Empty',
  Error = 'Error',
  Success = 'Success',
}

export interface GenerateResponse {
  result: GenerateResult
  data: string[]
}

export class PromptElements {
  private readonly _contentContext: ContentContext

  constructor(context: ContentContext) {
    this._contentContext = context
  }

  get cacheKey() {
    return this._contentContext.current.content.trimEnd()
  }

  stringify() {
    const list: string[] = []
    list.push(`你现在是一个测试专家，我需要你参考当前测试用例表格的数据，并补全我要求的内容。`)
    list.push(`当前正在编辑的单元格位置： ${this._contentContext.current.address} ，内容： ${this._contentContext.current.content}`)
    for (const item of this._contentContext.relative) {
      list.push(`相对位置(${item.dx}, ${item.dy})的单元格地址： ${item.address} ，内容： ${item.content}`)
    }
    for (const item of this._contentContext.static) {
      list.push(`静态位置的单元格地址： ${item.address} ，内容： ${item.content}`)
    }
    list.push(`请你补全当前正在编辑的单元格的内容，只需要给我补全的内容即可，不要返回其他多余文本。`)
    return list.join('\n')
  }
}
