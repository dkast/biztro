// Type declarations for react-frame-component.
// The package ships types at index.d.ts but its exports field does not expose
// them under moduleResolution "bundler". This ambient declaration ensures the
// types are available without coupling tsconfig to node_modules internals.

declare module "react-frame-component" {
  import * as React from "react"

  export interface FrameComponentProps
    extends React.IframeHTMLAttributes<HTMLIFrameElement>,
      React.RefAttributes<HTMLIFrameElement> {
    head?: React.ReactNode | undefined
    mountTarget?: string | undefined
    initialContent?: string | undefined
    contentDidMount?: (() => void) | undefined
    contentDidUpdate?: (() => void) | undefined
    dangerouslyUseDocWrite?: boolean | undefined
    children: React.ReactNode
  }

  const FrameComponent: React.ForwardRefExoticComponent<FrameComponentProps>
  export default FrameComponent

  export interface FrameContextProps {
    document?: Document
    window?: Window
  }

  export const FrameContext: React.Context<FrameContextProps>
  export const FrameContextProvider: React.Provider<FrameContextProps>
  export const FrameContextConsumer: React.Consumer<FrameContextProps>

  export function useFrame(): FrameContextProps
}
