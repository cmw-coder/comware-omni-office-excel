import type messages from 'src/i18n'

export type Locales = keyof typeof messages

export enum NetworkZone {
  Normal = 'Normal',
  Public = 'Public',
  Secure = 'Secure',
  Unknown = 'Unknown',
}
