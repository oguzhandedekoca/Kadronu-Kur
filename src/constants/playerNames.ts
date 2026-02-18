/**
 * Oyuncu adları listesi — istediğin gibi düzenleyebilirsin.
 * Select ile ekleme bu listeyi kullanır.
 */
export const PLAYER_NAMES = [
  "Oğuzhan",
  "Emin",
  "Adil",
  "Devlet",
  "Ümit",
  "Serkan",
  "Mehmet",
  "Agah",
  "Alihan",
  "Dinç",
  "Ayberk",
  "Erdem",
  "Sezer",
  "Hakan",
] as const;

export type PlayerName = (typeof PLAYER_NAMES)[number];
