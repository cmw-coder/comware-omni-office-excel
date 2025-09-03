declare namespace NodeJS {
  interface ProcessEnv {
    BUILD_RELEASE: 'true' | 'false' | undefined;
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
