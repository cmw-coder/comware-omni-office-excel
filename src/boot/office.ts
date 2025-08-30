import { defineBoot } from '#q-app/wrappers';
import { OfficeHelper } from 'src/types/OfficeHelper';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $officeHelper: OfficeHelper;
  }
}

export const officeHelper = new OfficeHelper();

export default defineBoot(async ({ app }) => {
  await officeHelper.init();
  app.config.globalProperties.$officeHelper = officeHelper;
});
