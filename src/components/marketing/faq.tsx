import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"

const FAQ = [
  {
    question: "¿Qué es un menú QR?",
    answer: `Un menú QR es un menú de restaurante que puede ser leído directamente en 
      el teléfono móvil del cliente, escanenando el código QR.`
  },
  {
    question: "¿Como funcionan los menú QR para los restaurantes?",
    answer: `El restaurante publica el menú en línea y crea un código QR que pueden poner en su negocio. 
      Los clientes simplemente escanean el código QR con su teléfono móvil y el menú les es mostrado
      en su navegador.`
  },
  {
    question: "¿Como creo un código QR para el menú de mi restaurante?",
    answer: `Primero se necesita publicar el menú de tu restaurante online, entonces puedes generar un código QR convirtiendo 
      la liga hacia tu menú en un código QR. Con Biztro puedes crear tu menú digital online, descargar tu código QR y
      utilizarlo en tu material impreso.`
  },
  {
    question: "¿Puedo actualizar el menú sin reimprimir el código QR?",
    answer: `Si, la ventaja de un menú digital es que puedes editarlo en cualquier momento sin necesidad de reimprimir 
      o actualizar una imagen o PDF de tu menú.`
  },
  {
    question: "¿Como escaneo un código QR para mi menú?",
    answer: `En tu dispositivo con Android o iOS puedes simplemente abrir la aplicación de la cámara y escanear tu código QR. 
      Después de esto, el menú se desplegará en tu navegador, como lo hace una página web normal. No necesitas 
      descargar una aplicación para leer el código QR de tu menú.`
  }
]

export default function Faq() {
  return (
    <section id="faq" className="pt-20 pb-28 sm:py-32">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:gap-12 sm:px-6 lg:max-w-7xl lg:gap-16 lg:px-8">
        <h2 className="font-display text-3xl tracking-tight text-balance text-gray-950 sm:text-4xl md:text-5xl dark:text-white">
          Preguntas y Respuestas
        </h2>
        <div>
          <Accordion type="single" collapsible>
            {FAQ.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="dark:border-gray-700"
              >
                <AccordionTrigger className="text-start sm:text-lg [&>svg]:text-violet-500 sm:[&>svg]:size-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="col-span-full">
          <p className="text-center">
            ¿Tienes más preguntas? Envianos un correo a{" "}
            <a
              href="mailto:contacto@biztro.co"
              className="text-violet-500 hover:underline"
            >
              contacto@biztro.co
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
