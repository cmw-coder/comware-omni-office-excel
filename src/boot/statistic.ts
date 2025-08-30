import { defineBoot } from '#q-app/wrappers'

import { StatisticManager } from 'src/types/StatisticManager'

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $statisticManager: StatisticManager
  }
}

export const statisticManager = new StatisticManager()

export default defineBoot(({ app }) => {
  app.config.globalProperties.$statisticManager = statisticManager
})
