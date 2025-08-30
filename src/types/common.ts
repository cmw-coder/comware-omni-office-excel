export interface ContentContext {
  current: {
    address: string
    content: string
  };
  relative: {
    address: string
    dx: number
    dy: number
    content: string
  }[];
  static: {
    address: string
    content: string
  }[];
}
