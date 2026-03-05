import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import { useTheme } from '../context/useTheme'

const SignupPage = () => {
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-stone-100 dark:bg-slate-950">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
                        Create Account
                    </h1>
                    <p className="mt-2 text-stone-500 dark:text-slate-400">
                        Start organizing your tasks today
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white border border-stone-200 shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700 dark:shadow-xl",
                            headerTitle: "text-stone-800 dark:text-white",
                            headerSubtitle: "text-stone-500 dark:text-slate-400",
                            socialButtonsBlockButton: "bg-white border-stone-200 hover:bg-stone-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600",
                            formFieldLabel: "text-stone-700 dark:text-slate-300",
                            formFieldInput: "bg-stone-50 border-stone-200 dark:bg-slate-900 dark:border-slate-600 dark:text-white",
                            formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
                            footerActionLink: "text-purple-500 hover:text-purple-600",
                            dividerLine: "bg-stone-200 dark:bg-slate-600",
                            dividerText: "text-stone-400 dark:text-slate-400",
                        }
                    }}
                    signInUrl="/login"
                    forceRedirectUrl="/dashboard"
                />
            </div>
        </div>
    )
}

export default SignupPage
