import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import JoinProject from './pages/JoinProject'
import LandingPage from './pages/LandingPage'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <>
          <SignedIn>
            <Navigate to="/dashboard" replace />
          </SignedIn>
          <SignedOut>
            <LoginPage />
          </SignedOut>
        </>
      } />
      <Route path="/signup" element={
        <>
          <SignedIn>
            <Navigate to="/dashboard" replace />
          </SignedIn>
          <SignedOut>
            <SignupPage />
          </SignedOut>
        </>
      } />
      <Route path="/join/:token" element={<JoinProject />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={
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