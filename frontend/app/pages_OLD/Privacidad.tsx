import { Layout } from "@/components/layout/Layout";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const Privacidad = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Política de Privacidad
              </h1>
              <p className="text-muted-foreground mb-8">
                Última actualización: Febrero 2025
              </p>

              <div className="prose prose-gray max-w-none">
                <div className="space-y-8 text-muted-foreground">
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Introducción</h2>
                    <p>
                      En PLIA nos tomamos muy en serio la privacidad de nuestros usuarios y clientes. 
                      Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos 
                      y protegemos su información personal en cumplimiento con la Ley N° 29733, 
                      Ley de Protección de Datos Personales del Perú, y su Reglamento aprobado 
                      mediante Decreto Supremo N° 003-2013-JUS.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Responsable del Tratamiento</h2>
                    <p className="mb-4">
                      El responsable del tratamiento de sus datos personales es PLIA, con domicilio 
                      en Lima, Perú.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Correo electrónico: hola@plia.pe</li>
                      <li>WhatsApp: +51 999 999 999</li>
                      <li>Teléfono: (01) 234-5678</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Datos Personales que Recopilamos</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">3.1 Datos proporcionados directamente</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Nombre completo</li>
                      <li>Documento de identidad (DNI/CE/RUC)</li>
                      <li>Correo electrónico</li>
                      <li>Número de teléfono / WhatsApp</li>
                      <li>Dirección física (cuando sea necesario)</li>
                      <li>Nombre del negocio o empresa</li>
                      <li>Información de facturación</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground mb-2">3.2 Datos recopilados automáticamente</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Dirección IP</li>
                      <li>Tipo de navegador y dispositivo</li>
                      <li>Sistema operativo</li>
                      <li>Páginas visitadas en nuestro sitio</li>
                      <li>Fecha y hora de acceso</li>
                      <li>Cookies y tecnologías similares</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">4. Finalidad del Tratamiento</h2>
                    <p className="mb-4">Utilizamos sus datos personales para:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Proporcionar los servicios contratados (diseño web, hosting, dominios)</li>
                      <li>Gestionar la relación contractual con el cliente</li>
                      <li>Procesar pagos y emitir comprobantes de pago</li>
                      <li>Brindar soporte técnico y atención al cliente</li>
                      <li>Enviar comunicaciones relacionadas con los servicios contratados</li>
                      <li>Enviar información comercial y promocional (con su consentimiento previo)</li>
                      <li>Mejorar nuestros servicios y experiencia del usuario</li>
                      <li>Cumplir con obligaciones legales y regulatorias</li>
                      <li>Prevenir fraudes y actividades ilegales</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">5. Base Legal del Tratamiento</h2>
                    <p className="mb-4">El tratamiento de sus datos se realiza sobre las siguientes bases legales:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Ejecución contractual:</strong> para proporcionar los servicios que ha contratado</li>
                      <li><strong>Consentimiento:</strong> para el envío de comunicaciones comerciales</li>
                      <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y prevenir fraudes</li>
                      <li><strong>Cumplimiento legal:</strong> para cumplir con obligaciones tributarias y regulatorias</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">6. Compartición de Datos</h2>
                    <p className="mb-4">
                      Podemos compartir sus datos personales con terceros únicamente en los 
                      siguientes casos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a proporcionar 
                        nuestros servicios (procesadores de pago, proveedores de hosting, registradores 
                        de dominios)</li>
                      <li><strong>Autoridades:</strong> cuando sea requerido por ley o por orden judicial</li>
                      <li><strong>Protección de derechos:</strong> para proteger nuestros derechos, 
                        propiedad o seguridad, o los de nuestros usuarios</li>
                    </ul>
                    <p className="mt-4">
                      No vendemos ni alquilamos sus datos personales a terceros con fines comerciales.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">7. Transferencia Internacional de Datos</h2>
                    <p>
                      Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del 
                      Perú. En estos casos, nos aseguramos de que existan las garantías adecuadas 
                      para la protección de sus datos personales, de acuerdo con la legislación 
                      peruana aplicable.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">8. Seguridad de los Datos</h2>
                    <p className="mb-4">
                      Implementamos medidas técnicas, administrativas y físicas para proteger sus 
                      datos personales contra acceso no autorizado, pérdida, alteración o 
                      destrucción, incluyendo:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Cifrado de datos en tránsito mediante SSL/TLS</li>
                      <li>Acceso restringido a datos personales solo a personal autorizado</li>
                      <li>Servidores seguros con protección contra intrusiones</li>
                      <li>Copias de seguridad periódicas</li>
                      <li>Políticas internas de seguridad de la información</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">9. Conservación de Datos</h2>
                    <p>
                      Conservamos sus datos personales durante el tiempo necesario para cumplir 
                      con las finalidades para las que fueron recopilados, incluyendo el 
                      cumplimiento de obligaciones legales, contables o de reporte. 
                      Generalmente, los datos se conservan durante la vigencia de la relación 
                      contractual y hasta 5 años después de su terminación para efectos legales 
                      y tributarios.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">10. Sus Derechos</h2>
                    <p className="mb-4">
                      De acuerdo con la Ley de Protección de Datos Personales, usted tiene los 
                      siguientes derechos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Acceso:</strong> derecho a conocer qué datos personales tenemos 
                        sobre usted</li>
                      <li><strong>Rectificación:</strong> derecho a corregir datos inexactos o 
                        incompletos</li>
                      <li><strong>Cancelación:</strong> derecho a solicitar la eliminación de sus 
                        datos cuando ya no sean necesarios</li>
                      <li><strong>Oposición:</strong> derecho a oponerse al tratamiento de sus datos 
                        en determinadas circunstancias</li>
                      <li><strong>Revocación del consentimiento:</strong> derecho a retirar su 
                        consentimiento en cualquier momento</li>
                    </ul>
                    <p className="mt-4">
                      Para ejercer estos derechos, puede contactarnos a través de hola@plia.pe 
                      indicando su nombre completo, documento de identidad y el derecho que 
                      desea ejercer.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">11. Cookies</h2>
                    <p className="mb-4">
                      Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación. 
                      Las cookies son pequeños archivos de texto que se almacenan en su dispositivo.
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Tipos de cookies que utilizamos:</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento 
                        básico del sitio</li>
                      <li><strong>Cookies de análisis:</strong> para entender cómo los visitantes 
                        interactúan con nuestro sitio</li>
                      <li><strong>Cookies de preferencias:</strong> para recordar sus preferencias 
                        de navegación</li>
                    </ul>
                    <p>
                      Puede configurar su navegador para rechazar cookies, aunque esto puede 
                      afectar algunas funcionalidades del sitio.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">12. Datos de Menores</h2>
                    <p>
                      Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos 
                      intencionalmente información personal de menores. Si detectamos que hemos 
                      recopilado datos de un menor, procederemos a eliminarlos.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">13. Enlaces a Terceros</h2>
                    <p>
                      Nuestro sitio puede contener enlaces a sitios web de terceros. No somos 
                      responsables de las prácticas de privacidad de estos sitios. Le 
                      recomendamos leer sus políticas de privacidad antes de proporcionar 
                      cualquier dato personal.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">14. Modificaciones a esta Política</h2>
                    <p>
                      Nos reservamos el derecho de modificar esta Política de Privacidad en 
                      cualquier momento. Los cambios serán publicados en esta página con la 
                      fecha de actualización. Le recomendamos revisar esta política 
                      periódicamente.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">15. Autoridad de Protección de Datos</h2>
                    <p>
                      Si considera que el tratamiento de sus datos personales vulnera la 
                      normativa vigente, puede presentar una reclamación ante la Autoridad 
                      Nacional de Protección de Datos Personales del Ministerio de Justicia 
                      y Derechos Humanos del Perú.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">16. Contacto</h2>
                    <p className="mb-2">
                      Para cualquier consulta sobre esta Política de Privacidad o sobre el 
                      tratamiento de sus datos personales, puede contactarnos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Correo electrónico: hola@plia.pe</li>
                      <li>WhatsApp: +51 999 999 999</li>
                      <li>Teléfono: (01) 234-5678</li>
                      <li>Dirección: Lima, Perú</li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Privacidad;
