export type dataObj<T = any> = Record<string | number, T>

export type AppContextType = {
    isMobile: boolean
    theme: string
    setTheme: (value: string) => void
}

export type message = {
    role?: string,
    content?: string,
    sources?: dataObj
    score?: boolean
    time?: number
}