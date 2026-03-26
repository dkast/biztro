import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"

const FAQ = [
  {
    question: "¿Qué es un menú QR?",
    answer: `Es un menú digital que tus clientes abren al escanear un código QR con la cámara de su teléfono.`
  },
  {
    question: "¿Cómo funcionan los menús QR para los restaurantes?",
    answer: `Publicas tu menú una sola vez, colocas el código QR en tu negocio y tus clientes lo abren en el navegador. Si haces cambios, el QR sigue siendo el mismo.`
  },
  {
    question: "¿Cómo creo un código QR para el menú de mi restaurante?",
    answer: `Primero publicas tu menú y después descargas el código QR desde Biztro. Luego puedes imprimirlo y usarlo en mesas, mostrador o material promocional.`
  },
  {
    question: "¿Puedo actualizar el menú sin reimprimir el código QR?",
    answer: `Sí. Puedes cambiar productos, precios o descripciones cuando quieras y el mismo código QR seguirá funcionando.`
  },
  {
    question: "¿Mis clientes necesitan una app para abrir el menú?",
    answer: `No. Solo necesitan abrir la cámara de su teléfono y escanear el código QR. El menú se abre en el navegador, como cualquier página web.`
  }
]

export default function Faq() {
  return (
    <section id="faq" className="pt-20 pb-28 sm:py-32">
      <div
        className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-2
          sm:gap-12 sm:px-6 lg:max-w-6xl lg:gap-16"
      >
        <h2
          className="font-display text-3xl tracking-tight text-balance
            text-taupe-950 sm:text-4xl dark:text-taupe-50"
        >
          Preguntas frecuentes
        </h2>
        <div>
          <Accordion type="single" collapsible>
            {FAQ.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="dark:border-taupe-800/30"
              >
                <AccordionTrigger
                  className="text-start text-taupe-950 sm:text-lg
                    dark:text-taupe-50 [&>svg]:text-taupe-500 sm:[&>svg]:size-5"
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className="text-base text-taupe-700 dark:text-taupe-300"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="col-span-full">
          <p className="text-center text-taupe-700 dark:text-taupe-300">
            ¿Te quedó alguna duda? Escríbenos a{" "}
            <a
              href="mailto:contacto@biztro.co"
              className="text-taupe-600 hover:underline focus-visible:underline"
            >
              contacto@biztro.co
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
