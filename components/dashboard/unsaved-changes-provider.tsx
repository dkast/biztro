"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type HTMLAttributes,
  type MouseEvent,
  type PropsWithChildren,
  type SetStateAction
} from "react"
import Link from "next/link"
import type { LinkProps as NextLinkProps } from "next/link"
import NextLink from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

export interface UnsavedChangesModalContent {
  message?: string
  dismissButtonLabel?: string
  proceedLinkLabel?: string
  proceedLinkHref?: string
}

export interface UnsavedChangesContext {
  modalContent: UnsavedChangesModalContent | undefined
  setModalContent: Dispatch<
    SetStateAction<UnsavedChangesModalContent | undefined>
  >
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
}

export const UnsavedChangesModal: React.FC<UnsavedChangesContext> = ({
  modalContent,
  setModalContent,
  showModal,
  setShowModal
}) => (
  <Dialog
    open={showModal}
    onOpenChange={() => {
      setShowModal(false)
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cambios sin guardar</DialogTitle>
        <DialogDescription>
          {modalContent?.message ?? "Tienes cambios sin guardar"}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setShowModal(false)
          }}
        >
          {modalContent?.dismissButtonLabel ?? "Regresar"}
        </Button>
        <Link
          href={modalContent?.proceedLinkHref ?? "/"}
          onClick={() => {
            setShowModal(false)
            setModalContent(undefined)
          }}
        >
          <Button>
            {modalContent?.proceedLinkLabel ?? "Descartar cambios"}
          </Button>
        </Link>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

const UnsavedChangesContext = createContext<UnsavedChangesContext | undefined>(
  undefined
)

export const UnsavedChangesProvider: React.FC<PropsWithChildren> = ({
  children
}) => {
  const [modalContent, setModalContent] = useState<
    UnsavedChangesModalContent | undefined
  >(undefined)
  const [showModal, setShowModal] = useState<boolean>(false)

  const context = useMemo(
    (): UnsavedChangesContext => ({
      modalContent,
      setModalContent,
      showModal,
      setShowModal
    }),
    [modalContent, setModalContent, showModal, setShowModal]
  )

  return (
    <UnsavedChangesContext.Provider value={context}>
      {children}
      <UnsavedChangesModal {...context} />
    </UnsavedChangesContext.Provider>
  )
}

export function useSetUnsavedChanges() {
  const context = useContext(UnsavedChangesContext)

  if (context === undefined) {
    throw new Error(
      "useSetUnsavedChanges must be called within <UnsavedChangesProvider />"
    )
  }

  const { setModalContent } = context

  const setUnsavedChanges = useCallback(
    (modalContent: Omit<UnsavedChangesModalContent, "proceedLinkHref">) => {
      setModalContent(modalContent)
    },
    [setModalContent]
  )

  const clearUnsavedChanges = useCallback(() => {
    setModalContent(undefined)
  }, [setModalContent])

  return useMemo(
    () => ({
      setUnsavedChanges,
      clearUnsavedChanges
    }),
    [setUnsavedChanges, clearUnsavedChanges]
  )
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext)

  if (context === undefined) {
    throw new Error(
      "useUnsavedChanges must be called within <UnsavedChangesProvider />"
    )
  }

  const { modalContent, setModalContent, setShowModal } = context

  const showUnsavedChangesModal = useCallback(
    (proceedLinkHref: string) => {
      setModalContent(currentContent => ({
        ...currentContent,
        proceedLinkHref
      }))
      setShowModal(true)
    },
    [setModalContent, setShowModal]
  )

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modalContent !== undefined) {
        e.preventDefault()
        return (e.returnValue =
          modalContent.message ?? "Tienes cambios sin guardar")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [modalContent])

  return useMemo(
    () => ({
      currentPageHasUnsavedChanges: modalContent !== undefined,
      showUnsavedChangesModal
    }),
    [modalContent, showUnsavedChangesModal]
  )
}

export type LinkProps = PropsWithChildren<
  NextLinkProps & HTMLAttributes<HTMLAnchorElement>
>

export const GuardLink: React.FC<LinkProps> = ({
  href,
  onClick,
  children,
  ...nextLinkProps
}) => {
  const nextRouter = useRouter()
  const { currentPageHasUnsavedChanges, showUnsavedChangesModal } =
    useUnsavedChanges()

  const handleLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()

      if (onClick) {
        onClick(e)
      }

      if (currentPageHasUnsavedChanges) {
        showUnsavedChangesModal(href.toString())
      } else {
        nextRouter.push(href.toString())
      }
    },
    [
      currentPageHasUnsavedChanges,
      href,
      nextRouter,
      onClick,
      showUnsavedChangesModal
    ]
  )

  return (
    <NextLink href={href} onClick={handleLinkClick} {...nextLinkProps}>
      {children}
    </NextLink>
  )
}
