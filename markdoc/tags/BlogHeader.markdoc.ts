import BlogHeader from "@/components/marketing/BlogHeader"
import { string } from "yup"

export const blogheader = {
  render: BlogHeader,
  description: "Despliega encabezado de entrada del blog",
  attributes: {
    title: {
      type: string,
      description: "El titulo de la entrada"
    },
    user: {
      type: string,
      description: "El autor de la entrada"
    }
  }
}
