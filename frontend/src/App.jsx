import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import JoinProject from './pages/JoinProject'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <>
          <SignedIn>
            <Navigate to="/" replace />
          </SignedIn>
          <SignedOut>
            <LoginPage />
          </SignedOut>
        </>
      } />
      <Route path="/signup" element={
        <>
          <SignedIn>
            <Navigate to="/" replace />
          </SignedIn>
          <SignedOut>
            <SignupPage />
          </SignedOut>
        </>
      } />
      <Route path="/join/:token" element={<JoinProject />} />
      <Route path="/" element={
        <>
          <SignedIn>
            <HomePage />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      } />
    </Routes>
  )
}

export default App