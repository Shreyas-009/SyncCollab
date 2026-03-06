import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.jsx'

import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/useTheme'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

const ClerkWithTheme = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: '#9333ea', // purple-600
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ClerkWithTheme>
          <App />
        </ClerkWithTheme>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
