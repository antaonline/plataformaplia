-- Freemium / Trial para website_build (landing y web institucional)
ALTER TABLE `project`
  ADD COLUMN `isTrial` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `trialEndsAt` DATETIME(3) NULL,
  ADD COLUMN `trialStatus` VARCHAR(191) NULL;

-- Plan freemium (solo website_build). Idempotente: solo inserta si no existe.
INSERT INTO `plan` (`name`, `description`, `price`, `hostingYear`, `slug`, `serviceType`, `createdAt`)
SELECT 'Plan Gratis', 'Crea tu web gratis y pruébala 30 días. Subdominio plia.pe, 1 web. Paga solo si decides conservarla.', 0, false, 'plia-free', 'WEBSITE_BUILD', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan` WHERE `slug` = 'plia-free');
