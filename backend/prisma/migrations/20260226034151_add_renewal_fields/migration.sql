-- AlterTable
ALTER TABLE `hostingsubscription` ADD COLUMN `cardToken` VARCHAR(191) NULL,
    ADD COLUMN `renewalDueAt` DATETIME(3) NULL,
    ADD COLUMN `renewalFinalNoticeSentAt` DATETIME(3) NULL,
    ADD COLUMN `renewalNoticeSentAt` DATETIME(3) NULL,
    ADD COLUMN `renewalReminderSentAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `HostingRenewal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subscriptionId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'PEN',
    `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `cardToken` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `providerResponse` JSON NULL,
    `rawResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,

    INDEX `HostingRenewal_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HostingRenewal` ADD CONSTRAINT `HostingRenewal_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `HostingSubscription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
