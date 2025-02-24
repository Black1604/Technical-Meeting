'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { GraphService } from '@/lib/microsoft-graph'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const graphService = GraphService.getInstance()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await graphService.initialize()
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async () => {
    setIsLoading(true)
    try {
      await graphService.login()
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error logging in:', error)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await graphService.logout()
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 