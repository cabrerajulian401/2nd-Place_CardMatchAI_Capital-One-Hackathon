// src/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signInAnonymously } from "firebase/auth"
import { auth } from "./firebase"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        setLoading(false)
      } else {
        // Sign in anonymously if not signed in
        try {
          const result = await signInAnonymously(auth)
          setUser(result.user)
        } catch (error) {
          console.error("Failed to sign in anonymously:", error)
        } finally {
          setLoading(false)
        }
      }
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
