import React from 'react'
import { SignIn } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'

const LoginPage = () => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-stone-100'
            }`}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>
                        Welcome Back
                    </h1>
                    <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                        Sign in to manage your tasks
                    </p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: isDark
                                ? "bg-slate-800 border border-slate-700 shadow-xl"
                                : "bg-white border border-stone-200 shadow-lg",
                            headerTitle: isDark ? "text-white" : "text-stone-800",
                            headerSubtitle: isDark ? "text-slate-400" : "text-stone-500",
                            socialButtonsBlockButton: isDark
                                ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                : "bg-white border-stone-200 hover:bg-stone-50",
                            formFieldLabel: isDark ? "text-slate-300" : "text-stone-700",
                            formFieldInput: isDark
                                ? "bg-slate-900 border-slate-600 text-white"
                                : "bg-stone-50 border-stone-200",
                            formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                            footerActionLink: "text-purple-500 hover:text-purple-600",
                            dividerLine: isDark ? "bg-slate-600" : "bg-stone-200",
                            dividerText: isDark ? "text-slate-400" : "text-stone-400",
                        }
                    }}
                    signUpUrl="/signup"
                    forceRedirectUrl="/"
                />
            </div>
        </div>
    )
}

export default LoginPage
