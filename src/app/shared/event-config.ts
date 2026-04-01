export type EventType = 'SF1' | 'SF2' | 'Final';

export interface EventConfig {
  year: number;
  event: EventType;
  countries: string[];
}

export const ACTIVE_EVENT: EventConfig = {
  year: 2025,
  event: 'SF2',
  countries: [
    'Australia',
    'Montenegro',
    'Republic of Ireland',
    'Latvia',
    'Armenia',
    'Austria',
    'Greece',
    'Lithuania',
    'Malta',
    'Georgia',
    'Denmark',
    'Czechia',
    'Luxembourg',
    'Israel',
    'Serbia',
    'Finland'
  ]
};
