import { defineBoot } from '#q-app/wrappers';

import { ContextManager } from 'src/types/context-manager';
import { ContextMode } from 'src/types/context-manager/types';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $contextManager: ContextManager;
  }
}

export const contextManager = new ContextManager();
contextManager.contextMode = ContextMode.testCase;

export default defineBoot(({ app }) => {
  app.config.globalProperties.$contextManager = contextManager;
});
