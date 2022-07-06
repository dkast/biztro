import Header from "@/components/blog/Header"

export const header = {
  render: Header,
  description: "Despliega encabezado de entrada del blog",
  attributes: {
    title: {
      type: String,
      description: "Titulo de la entrada"
    },
    category: {
      type: String,
      description: "Categoria de la entrada"
    },
    description: {
      type: String,
      description: "Breve descripcion de la entrada"
    },
    date: {
      type: Date,
      description: "Fecha de publicacion"
    },
    user: {
      type: String,
      description: "Autor de la entrada"
    }
  },
  selfClosing: true
}
