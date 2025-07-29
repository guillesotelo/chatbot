"use client";

import React, { createContext, useEffect, useState } from 'react'
import { AppContextType } from './types';

export const AppContext = createContext<AppContextType>({
    isMobile: false,
    theme: '',
    setTheme: () => { },
    isLoggedIn: null,
    setIsLoggedIn: () => { }
})

type Props = {
    children?: React.ReactNode
}

export const AppProvider = ({ children }: Props) => {
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [theme, setTheme] = useState('')
    const [windowLoading, setWindowLoading] = useState(true)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowLoading(false)
        }
        const localTheme = localStorage.getItem('preferredMode')
        setTheme(localTheme ? '--dark' : '')
        setIsMobile(isMobileDevice())

        getPreferredScheme()
        checkCredentials()

        const checkWidth = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        const getExternalTheme = (event: any) => {
            const externalTheme = event.data.theme
            if (externalTheme) setTheme(externalTheme === 'dark' ? '--dark' : '')
        }

        window.addEventListener("resize", checkWidth)
        window.addEventListener("message", getExternalTheme)
        return () => {
            window.removeEventListener("resize", checkWidth)
            window.removeEventListener("message", getExternalTheme)
        }
    }, [])

    useEffect(() => {
        const body = document.querySelector('body')
        if (body) {
            body.classList.remove('--dark')
            if (theme) body.classList.add('--dark')

            document.documentElement.setAttribute(
                "data-color-scheme",
                theme ? "dark" : "light"
            )
        }
        localStorage.setItem('preferredMode', theme)
    }, [theme])

    const isMobileDevice = () => {
        if (typeof window === 'undefined') return false // Server-side check

        const width = window.innerWidth
        const userAgent = window.navigator.userAgent.toLowerCase()

        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'
        ]

        const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword))
        const isSmallScreen = width <= 768

        return isMobile || isSmallScreen
    }

    const getPreferredScheme = () => {
        const savedMode = localStorage.getItem('preferredMode')
        setTheme(savedMode || window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ? '--dark' : '')
    }

    const checkCredentials = () => {
        const token = localStorage.getItem('app_token') || ''
        setIsLoggedIn(token === process.env.REACT_APP_TOKEN)
    }

    const contextValue = React.useMemo(() => ({
        isMobile,
        theme,
        setTheme,
        isLoggedIn,
        setIsLoggedIn
    }), [
        isMobile,
        theme,
        setTheme,
        isLoggedIn,
        setIsLoggedIn
    ])


    return windowLoading ? null : <AppContext.Provider value={contextValue}>
        {children}
    </AppContext.Provider>
}