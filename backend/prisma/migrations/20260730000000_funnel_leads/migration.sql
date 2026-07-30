-- Leads del embudo /tu-web-hoy (anuncios de Facebook): respuestas del quiz +
-- resultado (apto/no apto) + contacto + origen de la campaña.
-- CreateTable
CREATE TABLE `funnellead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessName` TEXT NULL,
    `contactName` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `outcome` VARCHAR(191) NOT NULL,
    `disqualifier` VARCHAR(191) NULL,
    `answers` TEXT NOT NULL,
    `utmSource` VARCHAR(191) NULL,
    `utmMedium` VARCHAR(191) NULL,
    `utmCampaign` VARCHAR(191) NULL,
    `fbclid` TEXT NULL,
    `referrer` TEXT NULL,
    `landingPath` TEXT NULL,
    `ipHash` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `funnellead_outcome_idx`(`outcome`),
    INDEX `funnellead_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
