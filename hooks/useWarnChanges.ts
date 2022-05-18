import Router from "next/router"
import { useEffect } from "react"

const useWarnChanges = (
  unsavedChanges: boolean,
  message = "Tiene cambios sin guardar - ¿Está seguro de abandonar esta página?"
) => {
  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return
      e.preventDefault()
      return (e.returnValue = message)
    }
    const handleBrowseAway = () => {
      if (!unsavedChanges) return
      if (window.confirm(message)) return
      Router.events.emit("routeChangeError")
      //push state, because browser back action changes link and changes history state
      // but we stay on the same page
      if (Router.asPath !== window.location.pathname) {
        window.history.pushState("", "", Router.asPath)
      }
      throw "routeChange aborted."
    }
    window.addEventListener("beforeunload", handleWindowClose)
    Router.events.on("routeChangeStart", handleBrowseAway)
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose)
      Router.events.off("routeChangeStart", handleBrowseAway)
    }
  }, [unsavedChanges])
}

export default useWarnChanges
