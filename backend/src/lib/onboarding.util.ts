// Normaliza el onboardingData de un proyecto a un objeto plano.
// Tolerante: acepta el objeto nativo (columna JSON de Prisma) o un string JSON
// (datos legados o resultados de consultas crudas). Nunca lanza.
export function readOnboarding(value: unknown): Record<string, any> {
  if (value == null) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value || '{}') ?? {}
    } catch {
      return {}
    }
  }
  if (typeof value === 'object') return value as Record<string, any>
  return {}
}

// Para GUARDAR onboardingData en la columna JSON de Prisma: pasa el objeto tal
// cual (el cast a any evita fricción con Prisma.InputJsonValue).
export function onboardingJson<T>(value: T): any {
  return value as any
}
