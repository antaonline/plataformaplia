/**
 * Index público de templates de correo de PLIA.
 * Cada template exporta una función pura: (payload) => { subject, html, text }.
 * El MailService los renderiza y los envía vía nodemailer.
 */

export * from './brand';
export * from './layout';

export { twoFactorTemplate, TwoFactorPayload } from './two-factor';
export { accountSetupTemplate, AccountSetupPayload } from './account-setup';
export { welcomeTemplate, WelcomePayload } from './welcome';
export {
  paymentReceiptTemplate,
  PaymentReceiptPayload,
} from './payment-receipt';
export { projectReadyTemplate, ProjectReadyPayload } from './project-ready';
export {
  projectPublishedTemplate,
  ProjectPublishedPayload,
} from './project-published';
export { projectFailedTemplate, ProjectFailedPayload } from './project-failed';
export {
  hostingPanelReadyTemplate,
  HostingPanelReadyPayload,
} from './hosting-panel-ready';
export {
  revisionAcknowledgedTemplate,
  RevisionAcknowledgedPayload,
} from './revision-acknowledged';
export { renewalNoticeTemplate, RenewalNoticePayload } from './renewal-notice';
export {
  contactMessageTemplate,
  ContactMessagePayload,
} from './contact-message';
