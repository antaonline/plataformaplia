import * as fs from 'fs';
import { join } from 'path';
import { userInfo } from 'os';

async function testPermissions() {
  const domain = 'thebestgym.plia.pe';
  const targetDir = `/home/${domain}/public_html`;
  const fileName = 'test-plia.html';
  const filePath = join(targetDir, fileName);
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head><title>Prueba de Permisos PLIA</title></head>
    <body>
      <h1>¡Conexion Exitosa!</h1>
      <p>Este archivo fue creado por el script de prueba de PLIA para verificar permisos de escritura.</p>
      <p>Fecha: ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;

  console.log('--- DIAGNOSTICO DE PERMISOS VPS ---');
  console.log(`Usuario actual del proceso: ${userInfo().username} (UID: ${userInfo().uid})`);
  console.log(`Ruta objetivo: ${targetDir}`);

  // 1. Verificar si la carpeta existe
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ ERROR: La carpeta ${targetDir} no existe.`);
    return;
  }
  console.log(`✅ La carpeta existe.`);

  // 2. Intentar escribir el archivo
  try {
    console.log(`Intentando escribir en: ${filePath}...`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n\x1b[32m✅ ¡EXITO! El archivo se ha creado correctamente.\x1b[0m`);
    console.log(`\x1b[36mAhora puedes verificarlo en: https://${domain}/${fileName}\x1b[0m`);
  } catch (error: any) {
    console.error(`\n\x1b[31m❌ ERROR AL ESCRIBIR ARCHIVO:\x1b[0m`);
    console.error(`Codigo de error: ${error.code}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.code === 'EACCES') {
      console.log('\n--- ANALISIS DEL PROBLEMA ---');
      console.log('El error EACCES confirma que el proceso de Node.js NO tiene permisos');
      console.log('para escribir en la carpeta de CyberPanel.');
      console.log(`Debes cambiar el dueño de la carpeta o dar permisos al usuario ${userInfo().username}.`);
    }
  }
}

testPermissions();
