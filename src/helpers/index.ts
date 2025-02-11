export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const autoScroll = () => {
    const { bottom, height, top } = document.documentElement.getBoundingClientRect()
    if(height - bottom + top <= 0) {
        // Scrollbar is at its bottom, so we automate scroll
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
}

export const getDate = (dateString: Date | number | string | undefined) => {
    if (dateString) {
        dateString = dateString instanceof Date ? dateString : Number(dateString)
        const date = new Date(dateString)
        if (date.getHours() === 24) date.setHours(0)
        return date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
}

export const sortArray = (arr: any[], key: string | number, order?: boolean) => {
    return arr.slice().sort((a: any, b: any) => {
        const aValue = a[key]
        const bValue = b[key]
        if (typeof aValue !== 'number' && !aValue) return 1
        if (typeof bValue !== 'number' && !bValue) return -1
        return order ? aValue < bValue ? 1 : -1 : aValue < bValue ? -1 : 1
    })
}