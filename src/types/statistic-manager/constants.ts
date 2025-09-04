import { NetworkZone } from 'src/types/common';

export const SERVICE_BASE_URL_MAP: Record<NetworkZone, string> = {
  [NetworkZone.Red]: 'http://10.113.36.121',
  [NetworkZone.Route]: 'http://10.113.12.206',
  [NetworkZone.Yellow]: `https://rdtest.h3c.com`,
  [NetworkZone.Public]: '',
};
