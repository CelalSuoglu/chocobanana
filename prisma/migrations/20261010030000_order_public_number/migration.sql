-- Short customer-facing order numbers: 4 digits and 1 letter.
ALTER TABLE "Order" ADD COLUMN "publicNumber" TEXT;

DO $$
DECLARE
  row_id TEXT;
  candidate TEXT;
  letters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
BEGIN
  FOR row_id IN SELECT id FROM "Order" WHERE "publicNumber" IS NULL LOOP
    LOOP
      candidate := lpad((floor(random() * 10000))::int::text, 4, '0')
        || substr(letters, 1 + floor(random() * length(letters))::int, 1);
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "Order" WHERE "publicNumber" = candidate
      );
    END LOOP;
    UPDATE "Order" SET "publicNumber" = candidate WHERE id = row_id;
  END LOOP;
END $$;

ALTER TABLE "Order" ALTER COLUMN "publicNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Order_publicNumber_key" ON "Order"("publicNumber");
