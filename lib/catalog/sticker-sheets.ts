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

export const stickerSheetListings: readonly StickerSheetListing[] = [];
