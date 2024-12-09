export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const autoScroll = () => {
    const { bottom, height, top } = document.documentElement.getBoundingClientRect()
    if(height - bottom + top <= 0) {
        // Scrollbar is at its bottom, so we automate scroll
        window.scrollTo({ top: document.body.scrollHeight + 100, behavior: 'smooth' })
    }
}