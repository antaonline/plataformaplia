-- AlterTable
ALTER TABLE `project`
  ADD COLUMN `customDomain` VARCHAR(191) NULL,
  ADD COLUMN `customDomainAttachedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `project_customDomain_key` ON `project`(`customDomain`);
