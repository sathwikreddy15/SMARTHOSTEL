import React from 'react'
import { useRouteError } from 'react-router-dom'
const ErrorLayout = () => {
  let error=useRouteError()
  return (
    <div >{error.status} {error.data}</div>
  )
}

export default ErrorLayout