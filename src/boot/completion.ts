import { defineBoot } from '#q-app/wrappers'

import { CompletionManager } from 'src/types/CompletionManager'

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $completionManager: CompletionManager
  }
}

export const completionManager = new CompletionManager()

export default defineBoot(({ app }) => {
  app.config.globalProperties.$completionManager = completionManager
})
