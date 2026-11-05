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
