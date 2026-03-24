const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(message);
  process.exit(1);
}

const root = process.cwd();
const schemaPath = path.join(root, 'prisma', 'schema.prisma');
const clientTypesPath = path.join(root, 'node_modules', '.prisma', 'client', 'index.d.ts');

if (!fs.existsSync(schemaPath)) {
  fail(`Missing schema file: ${schemaPath}`);
}

if (!fs.existsSync(clientTypesPath)) {
  fail(`Missing generated Prisma types: ${clientTypesPath}`);
}

const schema = fs.readFileSync(schemaPath, 'utf8');
if (!/onboardingData\s+Json\?/.test(schema)) {
  fail('schema.prisma no tiene onboardingData Json?. Revisa el esquema antes de desplegar.');
}

const clientTypes = fs.readFileSync(clientTypesPath, 'utf8');
const onboardingLine = clientTypes
  .split(/\r?\n/)
  .find((line) => line.includes('onboardingData'));

if (!onboardingLine) {
  fail('No se encontro onboardingData en node_modules/.prisma/client/index.d.ts');
}

if (/string\s*\|\s*null/i.test(onboardingLine)) {
  fail(
    `Prisma client sigue generado con onboardingData string|null: ${onboardingLine.trim()}`,
  );
}

console.log(`Prisma client OK: ${onboardingLine.trim()}`);
