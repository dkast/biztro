import React, { ChangeEvent } from "react"

interface InputGroupProps extends React.InputHTMLAttributes<HTMLElement> {
  value: string
  onChange: (event: ChangeEvent<HTMLElement>) => void
  placeholder?: string
  prepend: React.ReactNode
  type?: React.HTMLInputTypeAttribute
}

const InputGroup: React.FC<InputGroupProps> = ({
  value,
  onChange,
  placeholder,
  prepend,
  type = "text"
}) => {
  return (
    <div className="relative mt-1 rounded-lg shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="h-4 w-4 text-gray-400 sm:text-sm sm:leading-5">
          {prepend}
        </span>
      </div>
      <input
        className="block w-full rounded-lg border-gray-300 pl-9 transition duration-150 ease-in-out focus:border-zinc-600 focus:ring-zinc-600 sm:text-sm"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}

export default InputGroup
