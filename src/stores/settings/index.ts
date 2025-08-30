import { defineStore, acceptHMRUpdate } from 'pinia';
import { Dark } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DARK_MODES, DEFAULT_SERVER_URL_MAP } from 'stores/settings/constants';
import type { Locales, NetworkZone } from 'stores/settings/types';
import { checkUrlAccessible } from 'stores/settings/utils';

const { locale: i18nLocale } = useI18n();

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const baseUrl = ref<string>('');
    const darkMode = ref<Dark['mode']>(Dark.mode);
    const developerMode = ref(false);
    const locale = ref<string>(i18nLocale.value);

    const singleParagraph = ref(true);
    const username = ref<string>('');

    const themeProps = computed(() => {
      switch (darkMode.value) {
        case false:
          return { color: 'orange', icon: 'light_mode' };
        case 'auto':
          return { color: 'teal', icon: 'hdr_auto' };
        default:
          return { color: 'yellow', icon: 'dark_mode' };
      }
    });

    const applyLocale = () => {
      i18nLocale.value = locale.value as Locales;
    };

    const applyTheme = () => {
      Dark.set(darkMode.value);
    };

    const detectBaseUrl = async () => {
      const results = await Promise.all(
        Object.entries(DEFAULT_SERVER_URL_MAP).map(async ([zone, url]) => ({
          zone: <NetworkZone>zone,
          accessible: await checkUrlAccessible(url),
        })),
      );
      const availableNetworkZone = results.find(({ accessible }) => accessible)?.zone;
      if (availableNetworkZone) {
        baseUrl.value = DEFAULT_SERVER_URL_MAP[availableNetworkZone];
      }
    };

    const toggleTheme = () => {
      const index = DARK_MODES.indexOf(darkMode.value);
      darkMode.value = DARK_MODES[(index + 1) % DARK_MODES.length] ?? 'auto';
      applyTheme();
    };

    return {
      baseUrl,
      darkMode,
      developerMode,
      locale,
      username,
      singleParagraph,
      themeProps,
      applyLocale,
      applyTheme,
      detectBaseUrl,
      toggleTheme,
    };
  },
  {
    persist: true,
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
