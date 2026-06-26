import { createContext, useContext, useEffect, useState } from 'react'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Firebase real-time auth state listener (replaces Supabase onAuthStateChange)
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        // Cleanup listener on unmount
        return () => unsubscribe()
    }, [])

    const signUp = async ({ email, password }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            return { data: userCredential, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    const signIn = async ({ email, password }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            return { data: userCredential, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    const signOut = async () => {
        try {
            await firebaseSignOut(auth)
            return { error: null }
        } catch (err) {
            return { error: err }
        }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
