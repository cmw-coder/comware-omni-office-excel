import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $completionPublicApi: AxiosInstance;
  }
}

const completionPublicApi = axios.create({ baseURL: 'https://openrouter.ai/api/v1' });
const completionYellowApi = axios.create({ baseURL: '/api/v1' });

export default defineBoot(({ app }) => {
  app.config.globalProperties.$completionPublicApi = completionPublicApi;
});

export { completionPublicApi, completionYellowApi };
