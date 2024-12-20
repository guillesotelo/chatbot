export type dataObj<T = any> = Record<string | number, T>

export type AppContextType = {
    isMobile: boolean
    theme: string
    setTheme: (value: string) => void
}

export type messageType = {
    role?: string,
    content?: string,
    sources?: dataObj
    score?: boolean
    time?: number
    error?: boolean
    stopped?: boolean
    sessionId?: number | string
}

export type sessionType = dataObj & {
    name?: string,
    messages: messageType[],
    id?: number | null,
}