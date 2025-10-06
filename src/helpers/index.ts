import { dataObj } from "../types";
import { volvoModels } from "../constants/app"

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


export const getDate = (dateString: Date | number | string | undefined, showTime = true) => {
    if (dateString) {

        const date = Number(dateString) > 10000 ? new Date(Number(dateString)) : new Date(dateString)
        if (date.getHours() === 24) date.setHours(0)
        const options: any = showTime ?
            { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' }
        return date.toLocaleDateString('sv-SE', options)
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

export const cleanText = (text: string) =>
    text
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

export const getAverage = (data: dataObj[], key: string) => {
    let count = 0
    data.forEach(row => count += (row[key] || 0))
    return count / (data.length || 1)
}

export const fixMarkdownLinks = (text: string) => text.replace(/\[([^\]]+)\]\(([^)]+)\)\]+/g, "[$1]($2)")

export const whenDateIs = (date: Date | string | number | undefined, showDates = false) => {
    if (!date) return ''

    const current = new Date(date)
    const today = new Date().toLocaleDateString()
    const yesterday = new Date(new Date().getTime() - 86400000).toLocaleDateString() // minus 1 day in miliseconds
    const lastWeek = new Date().getTime() - 604800000
    const lastMonth = new Date().getTime() - 2505600000
    const lastYear = new Date().getTime() - 31449600000

    const hour = getDate(current)?.split(' ')[1]

    if (today === current.toLocaleDateString()) return `Today ${hour}`
    if (yesterday === current.toLocaleDateString()) return `Yesterday ${hour}`

    if (showDates) {
        if (current.getTime() >= lastWeek) return `Last week (${getDate(current)})`
        if (current.getTime() < lastWeek && current.getTime() > lastMonth) return `Last month (${getDate(current)})`
        if (current.getTime() < lastMonth && current.getTime() > lastYear) return `Months ago (${getDate(current)})`
        if (current.getTime() < lastYear) return `More than a year ago (${getDate(current)})`
        return getDate(current)
    }

    return getDate(current)
}

export const normalizeVolvoIdentifier = (prompt: string) => {
    let parsed = prompt
    volvoModels.forEach(identifier => {
        if (prompt.toUpperCase().includes(identifier)) {
            const pattern = identifier
                .split('')
                .map(ch => (/\d/.test(ch) ? ch : ch))
                .join('\\s*')

            const regex = new RegExp(pattern, 'gi')
            parsed = parsed.replace(regex, identifier)
        }
    })
    return parsed
}

export const fixPlantUML = (umlCode: string) => {
    return removeExtraClosingParentheses(umlCode)
        .split('\n')
        .map(line => {
            const trimmed = line.trim()
            if (trimmed.startsWith('//')) {
                return "'" + line.slice(line.indexOf('//') + 2)
            }
            return line
        })
        .join('\n')
}

export const checkPlantUML = async (url: string) => {
    try {
        const res = await fetch(url);
        const text = await res.text();

        if (text.toLowerCase().includes("error")) {
            return false
        }
        return true
    } catch (err) {
        console.error("PlantUML fetch error:", err)
        return false
    }
}

export const removeExtraClosingParentheses = (str: string) => {
    let balance = 0
    let result = ''

    for (let char of str) {
        if (char === '(') {
            balance++
            result += char
        } else if (char === ')') {
            if (balance > 0) {
                balance--
                result += char
            }
            // If balance is 0, we skip the extra ')'
        } else {
            result += char
        }
    }

    return result
}
