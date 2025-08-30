import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $rawModelApi: AxiosInstance;
  }
}

const rawModelApi = axios.create({ baseURL: 'https://openrouter.ai/api/v1' });

export default defineBoot(({ app }) => {
  app.config.globalProperties.$rawModelApi = rawModelApi;
});

export { rawModelApi };
