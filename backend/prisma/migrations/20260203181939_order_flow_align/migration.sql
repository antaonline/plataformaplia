-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `email` VARCHAR(191) NULL,
    MODIFY `userId` INTEGER NULL,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'APPROVED', 'DECLINED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `payment` MODIFY `transactionId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PasswordSetupToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordSetupToken_token_key`(`token`),
    INDEX `PasswordSetupToken_userId_idx`(`userId`),
    INDEX `PasswordSetupToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordSetupToken` ADD CONSTRAINT `PasswordSetupToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
