/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_planId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `currency` VARCHAR(191) NOT NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `amount` DECIMAL(65, 30) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE `subscription`;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `type` ENUM('LANDING', 'WEB') NOT NULL,
    `status` ENUM('WAITING_INFO', 'IN_PROGRESS', 'READY', 'DELIVERED') NOT NULL DEFAULT 'WAITING_INFO',
    `onboardingData` JSON NULL,
    `onboardingStep` INTEGER NOT NULL DEFAULT 1,
    `startedAt` DATETIME(3) NULL,
    `deadline` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hostingSubscriptionId` INTEGER NULL,

    UNIQUE INDEX `Project_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HostingSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `nextBillingAt` DATETIME(3) NOT NULL,
    `lastChargedAt` DATETIME(3) NULL,

    INDEX `Subscription_planId_fkey`(`planId`),
    INDEX `Subscription_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `authorizationCode` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rawResponse` JSON NOT NULL,
    `paidAt` DATETIME(3) NULL,

    UNIQUE INDEX `Payment_orderId_key`(`orderId`),
    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_hostingSubscriptionId_fkey` FOREIGN KEY (`hostingSubscriptionId`) REFERENCES `HostingSubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostingSubscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostingSubscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
