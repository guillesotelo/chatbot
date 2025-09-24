import { dataObj } from "../types";

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const autoScroll = (element: string = 'body', behavior: any = 'smooth') => {
    const targetElement = element === 'body' ? document.documentElement : document.querySelector(element);

    if (!targetElement) return; // Exit if the element is not found

    const { bottom, height, top } = targetElement.getBoundingClientRect();

    if (height - bottom + top <= 0) {
        // Scrollbar is at its bottom, so we automate scroll
        if (element === 'body') {
            window.scrollTo({ top: document.body.scrollHeight, behavior });
        } else {
            targetElement.scrollTo({ top: targetElement.scrollHeight, behavior });
        }
    }
};


export const getDate = (dateString: Date | number | string | undefined) => {
    if (dateString) {

        const date = Number(dateString) > 10000 ? new Date(Number(dateString)) : new Date(dateString)
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

export const cleanText = (text: string) => text.replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim()

export const getAverage = (data: dataObj[], key: string) => {
    let count = 0
    data.forEach(row => count += (row[key] || 0))
    return count / (data.length || 1)
}

export const fixMarkdownLinks = (text: string) => text.replace(/\[([^\]]+)\]\(([^)]+)\)\]+/g, "[$1]($2)")