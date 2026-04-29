export type EventType = 'SF1' | 'SF2' | 'Final' | 'AllSongs';

export interface EventConfig {
  year: number;
  event: EventType;
  countries: string[];
}

export const ACTIVE_EVENT: EventConfig = {
  year: 2026,
  event: 'SF1',
  countries: [
    'Moldova',
    'Sweden',
    'Croatia',
    'Greece',
    'Portugal',
    'Georgia',
    'Finland',
    'Montenegro',
    'Estonia',
    'Israel',
    'Belgium',
    'Lithuania',
    'San Marino',
    'Poland',
    'Serbia'
  ]
};
