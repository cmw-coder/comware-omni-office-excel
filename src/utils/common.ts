import { i18nGlobal } from 'boot/i18n';

export const i18nSubPath =
  (baseName: string) => (relativePath: string, data?: Record<string, unknown>) => {
    if (data) {
      return i18nGlobal.t(`${baseName}.${relativePath}`, data);
    } else {
      return i18nGlobal.t(`${baseName}.${relativePath}`);
    }
  };

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
