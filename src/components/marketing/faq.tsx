"use client"

import { useState } from "react"

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
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section
      id="faq"
      className="py-20"
      style={{ background: "#d4d0c8", fontFamily: "Tahoma, Verdana, Arial, sans-serif" }}
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* Window chrome */}
        <div
          style={{
            border: "2px solid",
            borderColor: "#ffffff #808080 #808080 #ffffff",
            boxShadow: "1px 1px 0px #000",
            background: "#d4d0c8"
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "linear-gradient(to right, #0a246a, #3a6ea5)",
              padding: "3px 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Window icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" fill="#ff0000" />
                <rect x="9" y="1" width="6" height="6" fill="#00aa00" />
                <rect x="1" y="9" width="6" height="6" fill="#0000ff" />
                <rect x="9" y="9" width="6" height="6" fill="#ffcc00" />
              </svg>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "bold",
                  fontFamily: "Tahoma, sans-serif"
                }}
              >
                Preguntas Frecuentes — Biztro Help Center
              </span>
            </div>
            {/* Window buttons */}
            <div style={{ display: "flex", gap: "2px" }}>
              {["_", "□", "✕"].map((btn, i) => (
                <button
                  key={i}
                  aria-label={["Minimizar", "Maximizar", "Cerrar"][i]}
                  style={{
                    width: "18px",
                    height: "16px",
                    fontSize: "10px",
                    lineHeight: "1",
                    background: "#d4d0c8",
                    border: "1px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000000",
                    fontFamily: "Marlett, Tahoma, sans-serif"
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Menu bar */}
          <div
            style={{
              background: "#d4d0c8",
              borderBottom: "1px solid #808080",
              padding: "2px 4px",
              display: "flex",
              gap: "2px"
            }}
          >
            {["Archivo", "Editar", "Ver", "Favoritos", "Ayuda"].map(item => (
              <button
                key={item}
                style={{
                  background: "transparent",
                  border: "1px solid transparent",
                  padding: "1px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "Tahoma, sans-serif",
                  color: "#000000"
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = "#d4d0c8"
                  el.style.borderColor = "#ffffff #808080 #808080 #ffffff"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = "transparent"
                  el.style.borderColor = "transparent"
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div
            style={{
              background: "#d4d0c8",
              borderBottom: "1px solid #808080",
              padding: "3px 6px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {[
              { label: "⬅", title: "Atrás" },
              { label: "➡", title: "Adelante" },
              { label: "⛔", title: "Detener" },
              { label: "🔄", title: "Actualizar" },
              { label: "🏠", title: "Inicio" }
            ].map(({ label, title }) => (
              <button
                key={title}
                title={title}
                style={{
                  width: "26px",
                  height: "24px",
                  background: "#d4d0c8",
                  border: "1px solid",
                  borderColor: "#ffffff #808080 #808080 #ffffff",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {label}
              </button>
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: "8px",
                border: "1px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                background: "#ffffff",
                padding: "1px 4px",
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                color: "#000080",
                display: "flex",
                alignItems: "center"
              }}
            >
              C:\biztro\ayuda\preguntas-frecuentes.htm
            </div>
          </div>

          {/* Content area */}
          <div
            style={{
              background: "#ffffff",
              padding: "16px",
              border: "1px solid",
              borderColor: "#808080 #ffffff #ffffff #808080",
              margin: "6px"
            }}
          >
            {/* Help heading */}
            <div style={{ marginBottom: "16px", borderBottom: "2px solid #0a246a", paddingBottom: "8px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#0a246a",
                  fontFamily: "Tahoma, sans-serif",
                  margin: 0
                }}
              >
                Preguntas frecuentes
              </h2>
              <p style={{ fontSize: "11px", color: "#666666", margin: "4px 0 0 0", fontFamily: "Tahoma, sans-serif" }}>
                Selecciona una pregunta para ver la respuesta
              </p>
            </div>

            {/* FAQ accordion — Win2K list style */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {FAQ.map((faq, index) => (
                <div key={index}>
                  {/* Question row */}
                  <button
                    onClick={() => toggle(index)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: openIndex === index ? "#0a246a" : "#d4d0c8",
                      border: "1px solid",
                      borderColor:
                        openIndex === index
                          ? "#000080 #000040 #000040 #000080"
                          : "#ffffff #808080 #808080 #ffffff",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontFamily: "Tahoma, sans-serif",
                      color: openIndex === index ? "#ffffff" : "#000000",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: openIndex === index ? "bold" : "normal"
                    }}
                  >
                    {/* Plus/minus icon */}
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "1px solid",
                        borderColor: openIndex === index ? "#7090c0" : "#808080",
                        background: openIndex === index ? "#1a3680" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        lineHeight: "1",
                        flexShrink: 0,
                        color: openIndex === index ? "#ffffff" : "#000000",
                        fontWeight: "bold"
                      }}
                      aria-hidden="true"
                    >
                      {openIndex === index ? "−" : "+"}
                    </span>
                    {faq.question}
                  </button>

                  {/* Answer panel */}
                  {openIndex === index && (
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid",
                        borderColor: "#808080 #ffffff #ffffff #808080",
                        borderTop: "none",
                        padding: "8px 12px 8px 28px",
                        fontSize: "11px",
                        fontFamily: "Tahoma, sans-serif",
                        color: "#000000",
                        lineHeight: "1.5"
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ color: "#0a246a", fontWeight: "bold", flexShrink: 0 }}>ℹ</span>
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div
            style={{
              background: "#d4d0c8",
              borderTop: "1px solid #808080",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "4px"
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                color: "#000000",
                borderRight: "1px solid #808080",
                paddingRight: "8px"
              }}
            >
              Listo
            </div>
            <div
              style={{
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                color: "#000000",
                borderRight: "1px solid #808080",
                padding: "0 8px"
              }}
            >
              Mi PC
            </div>
            <div
              style={{
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                color: "#000000"
              }}
            >
              🔒 Zona de confianza
            </div>
          </div>
        </div>

        {/* Contact notice — styled as a Windows dialog hint */}
        <div
          style={{
            marginTop: "12px",
            background: "#d4d0c8",
            border: "1px solid",
            borderColor: "#ffffff #808080 #808080 #ffffff",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "11px",
            fontFamily: "Tahoma, sans-serif"
          }}
        >
          <span style={{ fontSize: "24px", lineHeight: "1" }}>❓</span>
          <span style={{ color: "#000000" }}>
            ¿Te quedó alguna duda? Escríbenos a{" "}
            <a
              href="mailto:contacto@biztro.co"
              style={{ color: "#0000cc", textDecoration: "underline" }}
            >
              contacto@biztro.co
            </a>
          </span>
        </div>
      </div>
    </section>
  )
}
