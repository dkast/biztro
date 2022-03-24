import React from "react"

const PageHeader = ({ title }) => {
  return (
    <div className="min-w-0 flex-1">
      <h1
        id="primary-heading"
        className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl"
      >
        {title}
      </h1>
    </div>
  )
}

export default PageHeader
