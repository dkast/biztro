-- CreateTable
CREATE TABLE "MenuItemTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "menuItemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItemTranslation_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VariantTranslation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MenuItemTranslation_menuItemId_idx" ON "MenuItemTranslation"("menuItemId");

-- CreateIndex
CREATE INDEX "MenuItemTranslation_locale_idx" ON "MenuItemTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemTranslation_menuItemId_locale_key" ON "MenuItemTranslation"("menuItemId", "locale");

-- CreateIndex
CREATE INDEX "VariantTranslation_variantId_idx" ON "VariantTranslation"("variantId");

-- CreateIndex
CREATE INDEX "VariantTranslation_locale_idx" ON "VariantTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "VariantTranslation_variantId_locale_key" ON "VariantTranslation"("variantId", "locale");
