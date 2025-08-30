import type { Dark } from 'quasar'

import { NetworkZone } from 'stores/settings/types'

export const DARK_MODES: Dark['mode'][] = [false, 'auto', true] as const

export const DEFAULT_SERVER_URL_MAP: Record<NetworkZone, string> = {
  [NetworkZone.Normal]: 'http://10.113.36.121',
  [NetworkZone.Secure]: 'http://10.113.12.206',
  [NetworkZone.Public]: 'http://rdee.h3c.com',
  [NetworkZone.Unknown]: 'http://rdee.h3c.com',
};

