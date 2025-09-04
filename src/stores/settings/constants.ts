import type { Dark } from 'quasar';

import packageJson from 'app/package.json';
import { NetworkZone } from 'src/types/common';

export const DARK_MODES: Dark['mode'][] = [false, 'auto', true] as const;

export const NETWORK_ZONE_TEST_URL_MAP: Record<NetworkZone, string> = {
  [NetworkZone.Red]: 'http://10.113.36.121',
  [NetworkZone.Route]: 'http://10.113.12.206',
  [NetworkZone.Yellow]: `https://${packageJson.name}.aitester.h3c.com/ping`,
  [NetworkZone.Public]: 'https://openrouter.ai/images/icons/Microsoft.svg',
};
