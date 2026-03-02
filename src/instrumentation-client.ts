import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: "system",
      formTitle: "Ayúdanos a mejorar",
      submitButtonLabel: "Enviar",
      cancelButtonLabel: "Cancelar",
      confirmButtonLabel: "Confirmar",
      addScreenshotButtonLabel: "Agregar captura de pantalla",
      removeScreenshotButtonLabel: "Eliminar captura de pantalla",
      nameLabel: "Nombre",
      namePlaceholder: "Nombre",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "Correo electrónico",
      isRequiredLabel: "(requerido)",
      messageLabel: "Descripción",
      messagePlaceholder: "¿Cuál es el error? ¿Qué esperabas que sucediera?",
      successMessageText: "¡Gracias por tu ayuda!"
    }),
    Sentry.thirdPartyErrorFilterIntegration({
      filterKeys: ["biztro"],
      behaviour: "apply-tag-if-contains-third-party-frames"
    })
  ],

  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
