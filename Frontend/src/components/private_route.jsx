// src/PrivateRoute.js
import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../firebase/auth_context"

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
