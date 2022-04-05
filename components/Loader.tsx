import React from "react"
import { RotateSpinner } from "react-spinners-kit"

const Loader: React.FC<unknown> = () => (
  <div className="flex h-full flex-col items-center justify-center">
    <RotateSpinner color="#CBD5E0" />
  </div>
)

export default Loader
