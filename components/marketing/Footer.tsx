const Footer = (): JSX.Element => {
  return (
    <div className="m-8 flex w-full max-w-5xl justify-between px-4 text-gray-500 pb-safe md:px-0">
      <div>
        <span>&copy; Biztro {new Date().getFullYear()}</span>
      </div>
      <div>
        <a href="mailto:hola@biztro.co">Contacto</a>
      </div>
    </div>
  )
}

export default Footer
