import Header from "@/components/blog/Header"

export const header = {
  render: Header,
  description: "Despliega encabezado de entrada del blog",
  attributes: {
    title: {
      type: String,
      description: "El titulo de la entrada"
    },
    user: {
      type: String,
      description: "El autor de la entrada"
    }
  },
  selfClosing: true
}
