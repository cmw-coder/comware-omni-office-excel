import { defineBoot } from '#q-app/wrappers';

import { ContextManager } from 'src/types/context-manager';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $contextManager: ContextManager;
  }
}

export const contextManager = new ContextManager();

export default defineBoot(({ app }) => {
  app.config.globalProperties.$contextManager = contextManager;
});
