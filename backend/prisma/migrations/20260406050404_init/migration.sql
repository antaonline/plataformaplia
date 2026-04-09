-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `planId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'APPROVED', 'DECLINED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `billingCycleMonths` INTEGER NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Order_planId_fkey`(`planId`),
    INDEX `Order_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domainselection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `domainselection_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `hostingYear` BOOLEAN NOT NULL DEFAULT true,
    `slug` VARCHAR(191) NULL,
    `serviceType` ENUM('WEBSITE_BUILD', 'HOSTING_ONLY') NOT NULL DEFAULT 'WEBSITE_BUILD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `plan_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
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

    UNIQUE INDEX `project_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostingsubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,
    `sourceOrderId` INTEGER NULL,
    `serviceType` ENUM('WEBSITE_BUILD', 'HOSTING_ONLY') NOT NULL DEFAULT 'WEBSITE_BUILD',
    `billingCycleMonths` INTEGER NOT NULL DEFAULT 12,
    `cycleAmount` DECIMAL(65, 30) NULL,
    `metadata` JSON NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `nextBillingAt` DATETIME(3) NOT NULL,
    `lastChargedAt` DATETIME(3) NULL,
    `cardToken` VARCHAR(191) NULL,
    `renewalDueAt` DATETIME(3) NULL,
    `renewalNoticeSentAt` DATETIME(3) NULL,
    `renewalReminderSentAt` DATETIME(3) NULL,
    `renewalFinalNoticeSentAt` DATETIME(3) NULL,

    UNIQUE INDEX `hostingsubscription_sourceOrderId_key`(`sourceOrderId`),
    INDEX `Subscription_planId_fkey`(`planId`),
    INDEX `Subscription_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refreshtoken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `fingerprint` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refreshtoken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email2facode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `code` CHAR(6) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email2facode_userId_idx`(`userId`),
    INDEX `email2facode_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `authorizationCode` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rawResponse` JSON NOT NULL,
    `paidAt` DATETIME(3) NULL,

    UNIQUE INDEX `payment_orderId_key`(`orderId`),
    UNIQUE INDEX `payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passwordsetuptoken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `passwordsetuptoken_token_key`(`token`),
    INDEX `passwordsetuptoken_userId_idx`(`userId`),
    INDEX `passwordsetuptoken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostingrenewal` (
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

    INDEX `hostingrenewal_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostingaccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `activeSubscriptionId` INTEGER NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `status` ENUM('PROVISIONING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED', 'ERROR') NOT NULL DEFAULT 'PROVISIONING',
    `maxSites` INTEGER NOT NULL,
    `storageMb` INTEGER NOT NULL,
    `bandwidthMb` INTEGER NOT NULL,
    `mailboxesPerSite` INTEGER NOT NULL,
    `cyberpanelUsername` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `panelUrl` VARCHAR(191) NOT NULL,
    `encryptedPassword` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hostingaccount_userId_key`(`userId`),
    UNIQUE INDEX `hostingaccount_activeSubscriptionId_key`(`activeSubscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostedsite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostingAccountId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `siteType` ENUM('SUBDOMAIN', 'CUSTOM_DOMAIN') NOT NULL,
    `appType` ENUM('EMPTY', 'STATIC_UPLOAD', 'WORDPRESS') NOT NULL DEFAULT 'EMPTY',
    `status` ENUM('PROVISIONING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'ERROR', 'DELETED') NOT NULL DEFAULT 'PROVISIONING',
    `sslStatus` ENUM('PENDING', 'ACTIVE', 'FAILED', 'NOT_CONFIGURED') NOT NULL DEFAULT 'PENDING',
    `rootPath` VARCHAR(191) NOT NULL,
    `publicUrl` VARCHAR(191) NOT NULL,
    `storageUsedMb` INTEGER NOT NULL DEFAULT 0,
    `uploadCount` INTEGER NOT NULL DEFAULT 0,
    `lastUploadedAt` DATETIME(3) NULL,
    `lastDeployedAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hostedsite_domain_key`(`domain`),
    INDEX `hostedsite_hostingAccountId_idx`(`hostingAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostedmailbox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostedSiteId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hostedmailbox_email_key`(`email`),
    INDEX `hostedmailbox_hostedSiteId_idx`(`hostedSiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `Order_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domainselection` ADD CONSTRAINT `domainselection_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_hostingSubscriptionId_fkey` FOREIGN KEY (`hostingSubscriptionId`) REFERENCES `hostingsubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingsubscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingsubscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingsubscription` ADD CONSTRAINT `hostingsubscription_sourceOrderId_fkey` FOREIGN KEY (`sourceOrderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refreshtoken` ADD CONSTRAINT `refreshtoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email2facode` ADD CONSTRAINT `email2facode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passwordsetuptoken` ADD CONSTRAINT `passwordsetuptoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingrenewal` ADD CONSTRAINT `hostingrenewal_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `hostingsubscription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingaccount` ADD CONSTRAINT `hostingaccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostingaccount` ADD CONSTRAINT `hostingaccount_activeSubscriptionId_fkey` FOREIGN KEY (`activeSubscriptionId`) REFERENCES `hostingsubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostedsite` ADD CONSTRAINT `hostedsite_hostingAccountId_fkey` FOREIGN KEY (`hostingAccountId`) REFERENCES `hostingaccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostedmailbox` ADD CONSTRAINT `hostedmailbox_hostedSiteId_fkey` FOREIGN KEY (`hostedSiteId`) REFERENCES `hostedsite`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
