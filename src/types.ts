export type dataObj<T = any> = Record<string | number, T>

export type AppContextType = {
    isMobile: boolean
    theme: string
    setTheme: (value: string) => void
    isLoggedIn: boolean | null
    setIsLoggedIn: (value: boolean) => void
}

export type messageType = {
    id: string,
    role?: string,
    content?: string,
    completion?: string,
    sources?: dataObj
    score?: boolean
    time?: number
    error?: boolean
    stopped?: boolean
    sessionId?: number | string
    date?: string | Date | number
    transcribed?: boolean
    context?: boolean
    regenerated?: number
    loading?: boolean
    edit?: boolean
}

export type sessionType = dataObj & {
    name?: string,
    messages: messageType[],
    id?: number | null,
    updated?: Date | string | number
}

export type BufferEntry = {
    el: HTMLDivElement | null
    sessionId?: number | null
    streaming?: boolean
}

export type onChangeEventType = React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>