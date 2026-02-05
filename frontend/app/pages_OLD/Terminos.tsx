import { Layout } from "@/components/layout/Layout";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const Terminos = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Términos y Condiciones
              </h1>
              <p className="text-muted-foreground mb-8">
                Última actualización: Febrero 2025
              </p>

              <div className="prose prose-gray max-w-none">
                <div className="space-y-8 text-muted-foreground">
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Información General</h2>
                    <p>
                      Los presentes Términos y Condiciones regulan el uso de los servicios ofrecidos por 
                      PLIA (en adelante, "la Plataforma"), con domicilio en Lima, Perú. Al contratar 
                      nuestros servicios, el usuario (en adelante, "el Cliente") acepta íntegramente 
                      estos términos.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Servicios Ofrecidos</h2>
                    <p className="mb-4">PLIA ofrece los siguientes servicios:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Diseño y desarrollo de páginas web</li>
                      <li>Registro y renovación de dominios</li>
                      <li>Servicio de hosting (alojamiento web)</li>
                      <li>Certificados de seguridad SSL/HTTPS</li>
                      <li>Soporte técnico post-entrega</li>
                      <li>Mantenimiento y actualizaciones web</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Proceso de Contratación</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">3.1 Solicitud de Servicio</h3>
                    <p className="mb-4">
                      El Cliente deberá proporcionar la información necesaria para el desarrollo del 
                      proyecto, incluyendo textos, imágenes, logotipos y datos de contacto.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">3.2 Cotización y Aceptación</h3>
                    <p className="mb-4">
                      PLIA proporcionará una cotización detallada del servicio. La contratación se 
                      formaliza con el pago del anticipo correspondiente.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">3.3 Tiempos de Entrega</h3>
                    <p>
                      Los tiempos de entrega indicados son estimados y pueden variar según la 
                      complejidad del proyecto y la entrega oportuna de materiales por parte del Cliente.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">4. Precios y Formas de Pago</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">4.1 Precios</h3>
                    <p className="mb-4">
                      Todos los precios están expresados en Soles (S/) e incluyen el Impuesto General 
                      a las Ventas (IGV) cuando corresponda. Los precios pueden modificarse sin previo 
                      aviso, pero los proyectos ya contratados mantendrán el precio acordado.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">4.2 Formas de Pago</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Transferencia bancaria (BCP, Interbank, BBVA, Scotiabank)</li>
                      <li>Yape</li>
                      <li>Plin</li>
                      <li>Tarjetas de crédito o débito (Visa, Mastercard)</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground mb-2">4.3 Estructura de Pagos</h3>
                    <p>
                      Se requiere un anticipo del 50% para iniciar el proyecto. El 50% restante se 
                      abona antes de la publicación de la página web.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">5. Dominios</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">5.1 Registro</h3>
                    <p className="mb-4">
                      El dominio incluido en los planes corresponde a extensiones .com, .pe u otras 
                      disponibles. La disponibilidad del nombre de dominio está sujeta a verificación.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">5.2 Propiedad</h3>
                    <p className="mb-4">
                      El dominio es propiedad del Cliente. PLIA se encarga del registro y la 
                      administración técnica, pero el Cliente es el titular legal del mismo.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">5.3 Renovación</h3>
                    <p>
                      El primer año de dominio está incluido en el plan. Las renovaciones anuales 
                      posteriores tienen un costo adicional que será comunicado con anticipación.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">6. Hosting (Alojamiento Web)</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">6.1 Servicio</h3>
                    <p className="mb-4">
                      PLIA proporciona el servicio de hosting necesario para el funcionamiento de 
                      la página web del Cliente.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">6.2 Disponibilidad</h3>
                    <p className="mb-4">
                      PLIA se compromete a mantener una disponibilidad del servicio de al menos 99.5% 
                      anual, exceptuando mantenimientos programados o causas de fuerza mayor.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">6.3 Contenido Prohibido</h3>
                    <p>
                      El Cliente no podrá alojar contenido ilegal, difamatorio, que infrinja derechos 
                      de autor, pornográfico, o que promueva actividades ilegales.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">7. Revisiones y Modificaciones</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">7.1 Revisiones Incluidas</h3>
                    <p className="mb-4">
                      Cada plan incluye un número determinado de rondas de revisiones durante el 
                      desarrollo del proyecto.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">7.2 Modificaciones Adicionales</h3>
                    <p>
                      Las modificaciones que excedan las revisiones incluidas o que se soliciten 
                      después de la entrega del proyecto tendrán un costo adicional que será 
                      cotizado según la complejidad del cambio.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">8. Propiedad Intelectual</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">8.1 Contenido del Cliente</h3>
                    <p className="mb-4">
                      El Cliente es responsable de contar con los derechos de uso sobre los textos, 
                      imágenes, logotipos y demás materiales proporcionados para el desarrollo del 
                      proyecto.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">8.2 Diseño y Código</h3>
                    <p>
                      Una vez completado el pago total del proyecto, el Cliente obtiene los derechos 
                      de uso sobre el diseño y código fuente desarrollado específicamente para su 
                      proyecto.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">9. Soporte Técnico</h2>
                    <p className="mb-4">
                      El período de soporte técnico incluido varía según el plan contratado. Durante 
                      este período, PLIA atenderá consultas y realizará ajustes menores sin costo 
                      adicional.
                    </p>
                    <p>
                      El soporte se brinda de lunes a viernes de 9:00 AM a 6:00 PM y sábados de 
                      9:00 AM a 1:00 PM (hora de Lima, Perú).
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">10. Cancelaciones y Reembolsos</h2>
                    <h3 className="text-lg font-semibold text-foreground mb-2">10.1 Cancelación por el Cliente</h3>
                    <p className="mb-4">
                      Si el Cliente cancela el proyecto antes de que PLIA inicie el desarrollo, se 
                      reembolsará el 80% del anticipo. Una vez iniciado el desarrollo, no se 
                      realizarán reembolsos.
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-2">10.2 Cancelación por PLIA</h3>
                    <p>
                      PLIA se reserva el derecho de cancelar un proyecto en caso de incumplimiento 
                      de estos términos por parte del Cliente, en cuyo caso no habrá reembolso del 
                      anticipo.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">11. Limitación de Responsabilidad</h2>
                    <p>
                      PLIA no será responsable por daños indirectos, pérdida de datos, lucro cesante 
                      o cualquier otro daño derivado del uso o imposibilidad de uso de los servicios. 
                      La responsabilidad máxima de PLIA estará limitada al monto total pagado por el 
                      Cliente por el servicio contratado.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">12. Confidencialidad</h2>
                    <p>
                      PLIA se compromete a mantener la confidencialidad de toda la información 
                      proporcionada por el Cliente y a utilizarla únicamente para los fines del 
                      proyecto contratado.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">13. Ley Aplicable y Jurisdicción</h2>
                    <p>
                      Estos Términos y Condiciones se rigen por las leyes de la República del Perú. 
                      Cualquier controversia será sometida a la jurisdicción de los tribunales 
                      competentes de la ciudad de Lima.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">14. Modificaciones</h2>
                    <p>
                      PLIA se reserva el derecho de modificar estos Términos y Condiciones en 
                      cualquier momento. Los cambios serán publicados en esta página y entrarán 
                      en vigencia desde su publicación. Los proyectos ya contratados se regirán 
                      por los términos vigentes al momento de la contratación.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">15. Contacto</h2>
                    <p className="mb-2">
                      Para cualquier consulta sobre estos Términos y Condiciones, puede contactarnos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Correo electrónico: hola@plia.pe</li>
                      <li>WhatsApp: +51 999 999 999</li>
                      <li>Teléfono: (01) 234-5678</li>
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

export default Terminos;
