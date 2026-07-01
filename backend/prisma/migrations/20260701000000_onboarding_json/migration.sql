-- onboardingData: de LONGTEXT (JSON como texto) a JSON nativo.

-- 1) Limpia filas cuyo onboardingData NO sea JSON válido (ej. '' o texto roto).
--    Sin esto, el ALTER a JSON fallaría. La app trata null como {} igualmente.
--    En una columna que ya es JSON, JSON_VALID() = 1 siempre → no afecta nada.
UPDATE `project` SET `onboardingData` = NULL
  WHERE `onboardingData` IS NOT NULL AND JSON_VALID(`onboardingData`) = 0;

-- 2) Convierte la columna a JSON nativo.
ALTER TABLE `project` MODIFY `onboardingData` JSON NULL;
