import React from "react"

const BlogHeader = ({ title, user }) => {
  return (
    <div>
      <h1>{title}</h1>
      <div>
        <span>{user}</span>
      </div>
    </div>
  )
}

export default BlogHeader
