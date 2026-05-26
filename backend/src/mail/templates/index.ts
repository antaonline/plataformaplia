/**
 * Index publico de templates de correo de PLIA.
 * Cada template exporta una funcion pura: (payload) => { subject, html, text }.
 * El MailService los renderiza y los envia via nodemailer.
 *
 * Nota: re-exports de tipos/interfaces deben usar `export type` cuando
 * `isolatedModules: true` esta activo en tsconfig (Nest default).
 */

export * from './brand';
export * from './layout';

// === Funciones (runtime values) ===
export { twoFactorTemplate } from './two-factor';
export { accountSetupTemplate } from './account-setup';
export { welcomeTemplate } from './welcome';
export { paymentReceiptTemplate } from './payment-receipt';
export { projectReadyTemplate } from './project-ready';
export { projectPublishedTemplate } from './project-published';
export { projectFailedTemplate } from './project-failed';
export { hostingPanelReadyTemplate } from './hosting-panel-ready';
export { revisionAcknowledgedTemplate } from './revision-acknowledged';
export { revisionDeployedTemplate } from './revision-deployed';
export { renewalNoticeTemplate } from './renewal-notice';
export { contactMessageTemplate } from './contact-message';

// === Tipos (compile-time only, requieren `export type`) ===
export type { TwoFactorPayload } from './two-factor';
export type { AccountSetupPayload } from './account-setup';
export type { WelcomePayload } from './welcome';
export type { PaymentReceiptPayload } from './payment-receipt';
export type { ProjectReadyPayload } from './project-ready';
export type { ProjectPublishedPayload } from './project-published';
export type { ProjectFailedPayload } from './project-failed';
export type { HostingPanelReadyPayload } from './hosting-panel-ready';
export type { RevisionAcknowledgedPayload } from './revision-acknowledged';
export type { RevisionDeployedPayload } from './revision-deployed';
export type { RenewalNoticePayload } from './renewal-notice';
export type { ContactMessagePayload } from './contact-message';
