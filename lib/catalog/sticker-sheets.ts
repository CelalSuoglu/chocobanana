/**
 * Real sticker sheets sold once. This list is the only source for the
 * sticker shop. Leave it empty until a product has a real image, name,
 * description, and CAD price. Do not put sample prices here.
 */
export type StickerSheetListing = {
  id: string;
  nameEn: string;
  descriptionEn: string;
  /** CAD cents. Required before a sheet can be published. */
  amountCadCents: number;
  imageSrc: string;
};

export const stickerSheetListings: readonly StickerSheetListing[] = [
  {
    id: "xmas-mug-sticker-sheet",
    nameEn: "Xmas Mug Sticker Sheet",
    descriptionEn:
      "Cozy holiday mugs, candy canes, bows and bells on one pink striped sheet.",
    amountCadCents: 600,
    imageSrc: "/stickers/xmas-mug-sticker-sheet.jpg",
  },
  {
    id: "olivia-rodrigo-sticker-sheet",
    nameEn: "Olivia Rodrigo Sticker Sheet",
    descriptionEn:
      "A heart lock, a blue convertible, vampire lips and more on a lilac gingham sheet.",
    amountCadCents: 600,
    imageSrc: "/stickers/olivia-rodrigo-sticker-sheet.jpg",
  },
  {
    id: "tortured-poets-sticker-sheet",
    nameEn: "The Tortured Poets Sticker Sheet",
    descriptionEn:
      "A typewriter, the manuscript, a red phone box and a white rabbit on a soft grey sheet.",
    amountCadCents: 600,
    imageSrc: "/stickers/tortured-poets-sticker-sheet.jpg",
  },
  {
    id: "tiny-tasks-sticker-sheet",
    nameEn: "Tiny Tasks Sticker Sheet",
    descriptionEn:
      "To do, done, reminder and habit trackers to plan your week on a pink striped sheet.",
    amountCadCents: 600,
    imageSrc: "/stickers/tiny-tasks-sticker-sheet.jpg",
  },
  {
    id: "starry-numbers-sticker-sheet",
    nameEn: "Starry Numbers Sticker Sheet",
    descriptionEn:
      "Pastel star numbers 0 to 9 with little symbols for dates and lists, on a sky blue sheet.",
    amountCadCents: 600,
    imageSrc: "/stickers/starry-numbers-sticker-sheet.jpg",
  },
];

/**
 * Extra postage per sticker sheet outside Canada (CAD cents), added as the
 * Checkout shipping line: Canada CA$6, USA CA$7, elsewhere CA$8 per sheet.
 */
export const STICKER_POSTAGE_PER_SHEET_CAD_CENTS = {
  canada: 0,
  usa: 100,
  international: 200,
} as const;
