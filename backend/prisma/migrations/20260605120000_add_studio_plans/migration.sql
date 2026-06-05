-- AlterEnum: agregar STUDIO_SUBSCRIPTION a PlanServiceType
-- (en MariaDB, los enums se modifican alterando la columna)
ALTER TABLE `plan`
  MODIFY COLUMN `serviceType` ENUM('WEBSITE_BUILD', 'HOSTING_ONLY', 'STUDIO_SUBSCRIPTION')
  NOT NULL DEFAULT 'WEBSITE_BUILD';

-- CreateTable: StudioPlanLimits
CREATE TABLE `StudioPlanLimits` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `planId` INTEGER NOT NULL,

  -- Capacidad
  `maxProjects` INTEGER NOT NULL DEFAULT 1,
  `maxGenerationsPerMonth` INTEGER NOT NULL DEFAULT 10,

  -- Herramientas creativas
  `canUseClaude` BOOLEAN NOT NULL DEFAULT true,
  `canUseDalle` BOOLEAN NOT NULL DEFAULT true,
  `canUseFlux` BOOLEAN NOT NULL DEFAULT false,
  `canUseTripo3D` BOOLEAN NOT NULL DEFAULT false,
  `canUseMeshy` BOOLEAN NOT NULL DEFAULT false,
  `canUseHigsfield` BOOLEAN NOT NULL DEFAULT false,
  `canUseRunway` BOOLEAN NOT NULL DEFAULT false,
  `canUseLumaAI` BOOLEAN NOT NULL DEFAULT false,
  `canUseLottieLib` BOOLEAN NOT NULL DEFAULT true,

  -- Features del editor
  `canEditCode` BOOLEAN NOT NULL DEFAULT false,
  `canUseAdvancedCanvas` BOOLEAN NOT NULL DEFAULT false,
  `canUseInlineEditing` BOOLEAN NOT NULL DEFAULT true,
  `canUse3DTemplates` BOOLEAN NOT NULL DEFAULT false,
  `canUseCustomDomain` BOOLEAN NOT NULL DEFAULT false,
  `hasWatermark` BOOLEAN NOT NULL DEFAULT true,

  `supportTier` VARCHAR(32) NOT NULL DEFAULT 'community',
  `whiteLabelEnabled` BOOLEAN NOT NULL DEFAULT false,

  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `StudioPlanLimits_planId_key`(`planId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudioPlanLimits`
  ADD CONSTRAINT `StudioPlanLimits_planId_fkey`
  FOREIGN KEY (`planId`) REFERENCES `plan`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed: insertar los 4 planes de Plia Studio
-- 1. Free (lo que tenemos hoy en freemium)
INSERT INTO `plan` (`name`, `description`, `price`, `hostingYear`, `slug`, `serviceType`, `createdAt`)
VALUES (
  'Plia Studio Free',
  'Prueba PLIA Studio con generaciones básicas y subdominio plia.pe. Ideal para validar tu idea antes de invertir.',
  0,
  false,
  'studio-free',
  'STUDIO_SUBSCRIPTION',
  NOW(3)
);

-- 2. Starter S/59
INSERT INTO `plan` (`name`, `description`, `price`, `hostingYear`, `slug`, `serviceType`, `createdAt`)
VALUES (
  'Plia Studio Starter',
  'Para emprendedores individuales. Generaciones modernas con animaciones, dominio propio y hosting incluido.',
  59.00,
  true,
  'studio-starter',
  'STUDIO_SUBSCRIPTION',
  NOW(3)
);

-- 3. Pro S/189
INSERT INTO `plan` (`name`, `description`, `price`, `hostingYear`, `slug`, `serviceType`, `createdAt`)
VALUES (
  'Plia Studio Pro',
  'Para freelancers y diseñadores. Editor visual avanzado, modelos 3D con IA, plantillas cinematográficas y hosting Premium.',
  189.00,
  true,
  'studio-pro',
  'STUDIO_SUBSCRIPTION',
  NOW(3)
);

-- 4. Studio S/625
INSERT INTO `plan` (`name`, `description`, `price`, `hostingYear`, `slug`, `serviceType`, `createdAt`)
VALUES (
  'Plia Studio Agency',
  'Para pequeñas agencias. Proyectos ilimitados, video AI, white-label, multi-usuario y soporte prioritario.',
  625.00,
  true,
  'studio-agency',
  'STUDIO_SUBSCRIPTION',
  NOW(3)
);

-- Seed de StudioPlanLimits para cada plan recién creado
-- Usamos LAST_INSERT_ID via subqueries por slug para no depender de IDs hardcodeados

-- Free: solo Claude + DALL-E básico, 1 proyecto, 10 gen/mes, sin 3D ni video
INSERT INTO `StudioPlanLimits` (
  `planId`, `maxProjects`, `maxGenerationsPerMonth`,
  `canUseClaude`, `canUseDalle`, `canUseFlux`,
  `canUseTripo3D`, `canUseMeshy`, `canUseHigsfield`, `canUseRunway`, `canUseLumaAI`,
  `canUseLottieLib`,
  `canEditCode`, `canUseAdvancedCanvas`, `canUseInlineEditing`, `canUse3DTemplates`,
  `canUseCustomDomain`, `hasWatermark`,
  `supportTier`, `whiteLabelEnabled`, `updatedAt`
) VALUES (
  (SELECT id FROM `plan` WHERE slug = 'studio-free'),
  1, 10,
  true, true, false,
  false, false, false, false, false,
  true,
  false, false, true, false,
  false, true,
  'community', false, NOW(3)
);

-- Starter: + Flux, sin 3D ni video, dominio propio, sin watermark
INSERT INTO `StudioPlanLimits` (
  `planId`, `maxProjects`, `maxGenerationsPerMonth`,
  `canUseClaude`, `canUseDalle`, `canUseFlux`,
  `canUseTripo3D`, `canUseMeshy`, `canUseHigsfield`, `canUseRunway`, `canUseLumaAI`,
  `canUseLottieLib`,
  `canEditCode`, `canUseAdvancedCanvas`, `canUseInlineEditing`, `canUse3DTemplates`,
  `canUseCustomDomain`, `hasWatermark`,
  `supportTier`, `whiteLabelEnabled`, `updatedAt`
) VALUES (
  (SELECT id FROM `plan` WHERE slug = 'studio-starter'),
  3, 100,
  true, true, true,
  false, false, false, false, false,
  true,
  false, false, true, false,
  true, false,
  'email', false, NOW(3)
);

-- Pro: + Tripo3D, canvas avanzado, plantillas 3D, sin video AI
INSERT INTO `StudioPlanLimits` (
  `planId`, `maxProjects`, `maxGenerationsPerMonth`,
  `canUseClaude`, `canUseDalle`, `canUseFlux`,
  `canUseTripo3D`, `canUseMeshy`, `canUseHigsfield`, `canUseRunway`, `canUseLumaAI`,
  `canUseLottieLib`,
  `canEditCode`, `canUseAdvancedCanvas`, `canUseInlineEditing`, `canUse3DTemplates`,
  `canUseCustomDomain`, `hasWatermark`,
  `supportTier`, `whiteLabelEnabled`, `updatedAt`
) VALUES (
  (SELECT id FROM `plan` WHERE slug = 'studio-pro'),
  15, 500,
  true, true, true,
  true, false, false, false, false,
  true,
  true, true, true, true,
  true, false,
  'email', false, NOW(3)
);

-- Studio Agency: todo incluido, ilimitado, video AI, white-label
INSERT INTO `StudioPlanLimits` (
  `planId`, `maxProjects`, `maxGenerationsPerMonth`,
  `canUseClaude`, `canUseDalle`, `canUseFlux`,
  `canUseTripo3D`, `canUseMeshy`, `canUseHigsfield`, `canUseRunway`, `canUseLumaAI`,
  `canUseLottieLib`,
  `canEditCode`, `canUseAdvancedCanvas`, `canUseInlineEditing`, `canUse3DTemplates`,
  `canUseCustomDomain`, `hasWatermark`,
  `supportTier`, `whiteLabelEnabled`, `updatedAt`
) VALUES (
  (SELECT id FROM `plan` WHERE slug = 'studio-agency'),
  -1, -1,
  true, true, true,
  true, true, true, true, true,
  true,
  true, true, true, true,
  true, false,
  'priority', true, NOW(3)
);
