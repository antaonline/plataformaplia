-- AlterTable
ALTER TABLE `order` ADD COLUMN `affiliateCode` VARCHAR(191) NULL,
    ADD COLUMN `affiliateId` INTEGER NULL;

-- AlterTable
ALTER TABLE `plan` ADD COLUMN `affiliateCommission` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `affiliateaccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `payoutMethod` VARCHAR(191) NULL,
    `yapeNumber` VARCHAR(191) NULL,
    `yapeName` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankAccount` VARCHAR(191) NULL,
    `bankCci` VARCHAR(191) NULL,
    `bankHolder` VARCHAR(191) NULL,
    `bankDocType` VARCHAR(191) NULL,
    `bankDocNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `affiliateaccount_userId_key`(`userId`),
    UNIQUE INDEX `affiliateaccount_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affiliatereferral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `landingPath` TEXT NULL,
    `ipHash` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `affiliatereferral_affiliateId_idx`(`affiliateId`),
    INDEX `affiliatereferral_visitorId_idx`(`visitorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affiliatecommission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `payoutId` INTEGER NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `readAt` DATETIME(3) NULL,
    `reversedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `affiliatecommission_orderId_key`(`orderId`),
    INDEX `affiliatecommission_affiliateId_idx`(`affiliateId`),
    INDEX `affiliatecommission_payoutId_idx`(`payoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affiliatepayout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `method` VARCHAR(191) NOT NULL,
    `destination` TEXT NULL,
    `reference` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'REQUESTED',
    `notes` TEXT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueBy` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,

    INDEX `affiliatepayout_affiliateId_idx`(`affiliateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `order_affiliateId_idx` ON `order`(`affiliateId`);

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliateaccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliateaccount` ADD CONSTRAINT `affiliateaccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliatereferral` ADD CONSTRAINT `affiliatereferral_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliateaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliatecommission` ADD CONSTRAINT `affiliatecommission_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliateaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliatecommission` ADD CONSTRAINT `affiliatecommission_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliatecommission` ADD CONSTRAINT `affiliatecommission_payoutId_fkey` FOREIGN KEY (`payoutId`) REFERENCES `affiliatepayout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliatepayout` ADD CONSTRAINT `affiliatepayout_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliateaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
