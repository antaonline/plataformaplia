-- Showcase público en plia.pe/ejemplos
ALTER TABLE `Project`
  ADD COLUMN `isShowcase` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `showcaseSector` VARCHAR(191) NULL;
