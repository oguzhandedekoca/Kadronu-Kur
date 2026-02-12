/**
 * Oyuncu adları listesi — istediğin gibi düzenleyebilirsin.
 * Select ile ekleme bu listeyi kullanır.
 */
export const PLAYER_NAMES = [
  "Oğuzhan",
  "Emin",
  "Adil",
  "Burak",
  "İhsan",
  "Serkan",
  "Mehmet",
  "Agah",
  "Alihan",
  "Dinç",
  "Ayberk",
  "Erdem",
  "Furkan",
  "Hakan",
  "Devlet",
  "Ümit",
  "Emre",
] as const;

export type PlayerName = (typeof PLAYER_NAMES)[number];
