import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { marked } from 'marked';
import { useLocalStorage } from 'usehooks-ts';
import Dropdown from '../components/Dropdown';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp'; // C++
import 'prismjs/components/prism-csharp'; // C#
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss'; // Sass/SCSS
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash'; // Shell scripting
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-ini'; // Config files
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-matlab';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-sas';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-objectivec';
import 'prismjs/components/prism-latex';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-elixir';
import 'prismjs/components/prism-coffeescript';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-gradle';
import 'prismjs/components/prism-cmake';
import 'prismjs/components/prism-basic';
import 'prismjs/themes/prism.css';
import { AppContext } from '../AppContext';
import NewTab from '../assets/icons/maximize.svg'
import Close from '../assets/icons/close.svg'
import Edit from '../assets/icons/edit.svg'
import EditDark from '../assets/icons/edit-dark.svg'
import Trash from '../assets/icons/trash.svg'
import Export from '../assets/icons/export.svg'
import ExportDark from '../assets/icons/export-dark.svg'
import Reload from '../assets/icons/reload3.png'
import HP from '../assets/images/veronica-logo3.png';
import HP_DARK from '../assets/images/veronica-logo3_dark.png';
import NewContext from '../assets/icons/new-context.svg';
import { dataObj, messageType, sessionType } from '../types';
import { toast } from 'react-toastify';
import { APP_VERSION, gratitudePatterns, greetingPatterns, instructionEnd, instructionStart, POPUP_HEIGHT, POPUP_WIDTH, POPUP_WINDOW_HEIGHT, POPUP_WINDOW_WIDTH, questionStarters, referencePatterns, TECH_ISSUE_LLM } from '../constants/app';
import { autoScroll, cleanText, sleep, sortArray } from '../helpers';
import ChatOptions from '../assets/icons/options.svg'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from '../components/Tooltip';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { useNavigate } from "react-router-dom";
import SearchBar from '../components/SearchBar';
import NewChat from '../assets/icons/new-chat.svg'

const MODES = [
    {
        value: 'query',
        title: 'Use context from docs',
        description: 'Uses the context from the ingested documents to answer the questions',
    },
    {
        value: 'chat',
        title: 'Without context',
        description: 'No context from files',
    },
]

// const apiURl = process.env.REACT_APP_ENV === 'production' ? API_URL : LOCAL_API_URL
const apiURl = process.env.REACT_APP_SERVER_URL

export function Chat() {
    const [mode, setMode] = useLocalStorage<(typeof MODES)[number]['value']>('chat-mode', 'query')
    const [input, setInput] = useState('')
    const [copyMessage, setCopyMessage] = useState(-1)
    const [goodScore, setGoodScore] = useState(-1)
    const [badScore, setBadScore] = useState(-1)
    const [greetings, setGreetings] = useState(' ⬤')
    const [prod, setProd] = useState(true)
    const [renderFullApp, setRenderFullApp] = useState(true) // Change to window.innerWidth > 1050 when ready to use popup mode
    const [renderAdmin, setRenderAdmin] = useState(false)
    const [minimized, setMinimized] = useState(false) // Set to default true only for production (to use the button) * default false fixes Firefox issue
    const [isLoading, setIsLoading] = useState(false)
    const [useDocumentContext, setUseDocumentContext] = useState<boolean>(mode === 'query' || true)
    const [scrollLocked, setScrollLocked] = useState(false)
    const [timePassed, setTimePassed] = useState(0)
    const [sessions, setSessions] = useState<sessionType[]>([])
    const [filteredSessions, setFilteredSessions] = useState<sessionType[]>([])
    const [sessionId, setSessionId] = useState<null | number | undefined>(null)
    const [showOptions, setShowOptions] = useState<null | number | undefined>(null)
    const [sessionNames, setSessionNames] = useState<dataObj>({})
    const [sessionOptionStyles, setSessionOptionStyles] = useState<dataObj>({})
    const [feedbackData, setFeedbackData] = useState<sessionType | dataObj | null>(null)
    const [showLogin, setShowLogin] = useState(false)
    const [loginData, setLoginData] = useState<null | dataObj>(null)
    const [loginMessage, setLoginMessage] = useState('')
    const [popupHeight, setPopupHeight] = useState('60px')
    const [sessionDate, setSessionDate] = useState<Date | null>(null)
    const { theme, setTheme, isMobile, isLoggedIn, setIsLoggedIn } = useContext(AppContext)
    const messageRef = useRef<HTMLTextAreaElement>(null)
    const stopwatchIntervalId = useRef<number | null>(null)
    const timePassedRef = useRef(timePassed)
    const stopGenerationRef = useRef(false)
    const streamIdRef = useRef<string | null>(null)
    const resetMemoryRef = useRef<null | HTMLImageElement>(null)
    const memoryRef = useRef<dataObj>({})
    const greetingsInterval = useRef<any>(null)
    const appUpdateRef = useRef<any>(null)
    const outputRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const popup = new URLSearchParams(window.location.search).get('popup')
        const token = new URLSearchParams(window.location.search).get('token')
        const _theme = new URLSearchParams(window.location.search).get('theme')
        const login = new URLSearchParams(window.location.search).get('login')

        if (popup) {
            setRenderFullApp(false)
            setMinimized(true)
            const body = document.querySelector('body')
            if (body) body.style.overflow = 'hidden'
        }

        if (token === process.env.REACT_APP_ADMIN_TOKEN) setRenderAdmin(true)

        if (_theme) setTheme(_theme !== 'false' ? '--dark' : '')

        setShowLogin(Boolean(login))

        const handleScroll = () => {
            const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
            if (!isAtBottom) {
                setScrollLocked(true);
            }
        }

        const hideSessionOptions = (e: any) => {
            if (e.target && e.target.className && typeof e.target.className === 'string' &&
                !e.target.className.includes('chat__panel-session-option')
                && !e.target.className.includes('chat__panel-session-item')
                && !e.target.className.includes('chat__panel-session-rename')) {
                setShowOptions(null)
                setSessionNames({})
            }
        }

        getLocalSessions(popup)
        checkForAppUpdates()

        window.addEventListener('scroll', handleScroll)
        document.addEventListener('click', hideSessionOptions)

        if (messageRef.current) messageRef.current.focus()

        setSessionDate(new Date())

        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('click', hideSessionOptions)
        }
    }, [])

    // useEffect(() => {
    //     if (sessionId) console.log('memory', memoryRef.current[sessionId])
    // }, [memoryRef.current])

    useEffect(() => {
        setUseDocumentContext(mode === 'query')
    }, [mode])

    useEffect(() => {
        const textarea = document.getElementById('message')
        if (textarea) resizeTextArea(textarea)
    }, [input])

    useEffect(() => {
        timePassedRef.current = timePassed
    }, [timePassed])

    useEffect(() => {
        const s = getSession()

        if (s.completion && stopwatchIntervalId.current) {
            clearInterval(stopwatchIntervalId.current)
        }
        if (s.messages.length) {
            const userMessage = s.messages[s.messages.length - 1].role === 'user'
            if (userMessage && !timePassed && !stopwatchIntervalId.current) startStopwatch()
            else if (stopwatchIntervalId.current) {
                clearInterval(stopwatchIntervalId.current)
                stopwatchIntervalId.current = null
            }
        }
        if (sessionId) localStorage.setItem('chatSessions', JSON.stringify(sessions))

        setFilteredSessions(sortArray(sessions, 'updated', true))

        updateMemory()
    }, [sessions])

    useEffect(() => {
        renderCodeBlockHeaders()
        if (messageRef.current) messageRef.current.focus()
    }, [sessionId, feedbackData])

    useEffect(() => {
        if (!minimized) {
            generateGreetings()
            renderCodeBlockHeaders()
        }
    }, [minimized])

    const needsContext = (userPrompt: string): boolean => {
        let matches = false
        if (sessionId && memoryRef.current[sessionId] && memoryRef.current[sessionId].memory) {
            const splittedPrompt = userPrompt.split(' ')
            splittedPrompt.forEach(word => {
                if (referencePatterns.includes(cleanText(word.replace('?', '')).toLowerCase())) matches = true
            })
            if (referencePatterns.includes(cleanText(userPrompt.replace('?', '')).toLowerCase())) matches = true
        }
        return matches
    }

    const checkForAppUpdates = () => {
        const checkAppVersion = async () => {
            try {
                const response = await fetch(`${apiURl}/api/get_app_version`, { method: 'GET' })
                if (response && response.ok) {
                    const { app_version } = await response.json()
                    if (app_version && app_version !== APP_VERSION) {
                        const tryUpdate = localStorage.getItem('tryUpdate')
                        if (!tryUpdate) window.location.reload()
                        localStorage.setItem('tryUpdate', APP_VERSION)
                        console.log('Veronica just updated to the latest version: ', app_version)
                    } else {
                        console.log('Veronica version is the latest: ', app_version)
                    }
                }
            } catch (error) {
                console.error('An error occurred while updating Veronica version.')
            }
        }

        if (appUpdateRef.current) clearInterval(appUpdateRef.current)
        checkAppVersion()

        appUpdateRef.current = setInterval(checkAppVersion, 60000)
    }

    const updateMemory = () => {
        if (!sessionId || isLoading || !memoryRef.current || !getSession().messages.length) return
        let chatContext = ['']
        const maxChars = 3500
        const rMessages = [...getSession().messages].reverse() // mutation from the original
        const getPrompt = (ctx: string[]) => instructionStart + ctx.join('') + instructionEnd // instructions + user prompt
        const currentMemory = memoryRef.current[sessionId] || null
        let index = currentMemory && (currentMemory.index || currentMemory.index === 0) ? currentMemory.index : rMessages.length // the actual index from the messages array (ordered)
        let rIndex = rMessages.length - index // reversed index, needed for our memory operation

        rMessages.forEach((m: dataObj, i: number) => {
            const message = `\n${m.role === 'assistant' ? m.content.split('<br/><br/><strong>Source')[0] : m.content}\n`
            if (m.content
                && getPrompt(chatContext.concat(message)).length <= maxChars
                && (i < rIndex || !currentMemory)
                && !TECH_ISSUE_LLM.includes(m.content)
                && !m.content.includes('[STOPPED]')
                && !m.content.includes(`Oops! It looks like I'm having a bit of a technical hiccup`)) {

                chatContext.unshift(message)
                index = rMessages.length - 1 - i

            } else if (i === 0 && getPrompt(chatContext.concat(message)).length >= maxChars) {
                // case when the last message only is very long, then we truncate it
                chatContext.unshift(message.split('').slice(0, maxChars).join(''))
                index = rMessages.length - 1
            }
        })

        const newMemory = {
            ...memoryRef.current,
            [sessionId]: {
                memory: chatContext.join('').length ? chatContext.join('') : '',
                index
            }
        }
        memoryRef.current = newMemory
        localStorage.setItem('memory', JSON.stringify(newMemory))
    }

    const getLocalSessions = (popup: undefined | null | string = null) => {
        const localSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]')
        const localMemory = JSON.parse(localStorage.getItem('memory') || 'null')
        if (localSessions.length) {
            if (localMemory) memoryRef.current = localMemory

            // Lets bring a new session each time we open the chat in popup mode
            let newChatId = null
            localSessions.forEach((s: sessionType) => {
                if (s.name === 'New chat' && !s.messages.length)
                    newChatId = s.id
            })
            if (newChatId) {
                setSessionId(newChatId)
                setSessions(localSessions)
                return generateGreetings()
            }

            if (popup) {
                const newId = new Date().getTime()
                const newSession = {
                    id: newId,
                    messages: [],
                    name: 'New chat',
                    updated: newId
                }
                setSessions(localSessions.map((s: sessionType) => (
                    {
                        ...s,
                        updated: s.updated || s.id
                    }
                )).concat(newSession))

                setTimeout(() => {
                    setSessionId(newId)
                    generateGreetings()
                }, 100)
            } else {
                setSessions(localSessions.map((s: sessionType) => (
                    {
                        ...s,
                        updated: s.updated || s.id
                    }
                )))

                setSessionId(JSON.parse(localStorage.getItem('currentSession') || 'null') || localSessions[localSessions.length - 1].id)
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }), 5)
            }

        } else {
            const newId = new Date().getTime()
            const newSessionBook = [{ id: newId, messages: [], name: 'New chat', updated: newId }]
            setSessions(newSessionBook)
            setSessionId(newId)
            generateGreetings()
        }
    }

    const getSession = (): sessionType => {
        return sessions.find(s => s.id === sessionId) || { messages: [], id: null }
    }

    const startStopwatch = () => {
        if (stopwatchIntervalId.current) clearInterval(stopwatchIntervalId.current)
        stopwatchIntervalId.current = window.setInterval(() => {
            setTimePassed(t => t + 100)
        }, 100)
    }

    const removeUnwantedChars = (str: string) => {
        const unwantedPatterns = [
            ' ',
            'Assistant:',
            'AI:',
            'Human:',
            'User: ',
            'Response:',
            'Veronica:',
            "Answer:",
            '", respond to this:'
        ]
        const regex = new RegExp(unwantedPatterns.join('|'), 'g')
        return str.replace(regex, '')
    }

    const isCompleteBlock = (text: string) => {
        // const trimmed = text.trim();

        // return (
        //     /\n{2,}/.test(trimmed) || // Paragraph break
        //     /(\n[-*+] |\n\d+\. )/.test(trimmed) && /\n\n/.test(trimmed) || // Likely list
        //     /```[\s\S]*?```/.test(trimmed) || // Complete code block
        //     />[^\n]*\n\n/.test(trimmed) // Blockquote closed
        // );

        // code block
        if (text.includes('```')) return (text.split("```").length - 1) % 2 === 0
        // lists
        if (text.includes('*') || text.includes('-')) return (text.indexOf('\n\n') > text.indexOf('*') || text.indexOf('\n\n') > text.indexOf('-'))

        return true
    }

    let tokenBuffer = ''
    const addToken = async (newToken: string, animate: boolean = true) => {
        if (!outputRef.current) return

        if (!tokenBuffer && getSession().messages.length > 2) {
            outputRef.current.style.transition = '1s'
            outputRef.current.style.minHeight = renderFullApp ? '65vh' : '45vh'
            autoScroll(!renderFullApp ? '.chat__main' : 'body')
        }

        tokenBuffer += newToken

        if (!animate) {
            return outputRef.current.innerHTML = await marked.parse(tokenBuffer + ' ⬤')
        }

        const shouldRender = isCompleteBlock(outputRef.current.innerHTML) && tokenBuffer.length > 60
        //  || tokenBuffer.length > 200

        if (!shouldRender || !tokenBuffer) return

        const html = await marked.parse(tokenBuffer);
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Append each top-level node with animation
        Array.from(temp.childNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const span = document.createElement('span')
                span.innerHTML = (node as HTMLElement).innerHTML.replaceAll('```\n', '</code></pre>').replaceAll('```', '<pre><code class="language-">')
                span.classList.add('chat__token');
                outputRef.current!.appendChild(span);
            } else if (node.nodeValue !== '\n') outputRef.current!.appendChild(node);
        });

        tokenBuffer = ''
    };

    const saveAnalytics = async (prompt: string) => {
        try {
            const session = getSession()
            const duration_seconds = (new Date().getTime() - new Date(sessionDate || new Date()).getTime()) / 1000

            const analytics = {
                duration: 0,
                session_id: session.id,
                message_count: session.messages.length,
                token_count: prompt.length,
                duration_seconds
            }

            const response = await fetch(`${apiURl}/api/save_analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analytics)
            })

        } catch (error) {
            console.error(error)
        }
    }

    const getModelResponse = async (content: string) => {
        if (isLoading) return
        try {
            setIsLoading(true)
            setSessions(prev => {
                return prev.map(s => {
                    if (s.id === getSession().id) {
                        return {
                            ...s,
                            isLoading: true
                        }
                    }
                    return s
                })
            })

            saveAnalytics(content)

            const response = await fetch(`${apiURl}/api/prompt_route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                },
                body: new URLSearchParams({
                    user_prompt: content || '',
                    use_context: useDocumentContext ? 'true' : 'false',
                    // use_history: useMemory ? 'true' : 'false',
                    // stream_id: streamId ? String(streamId) : ''
                }),
            })
            streamIdRef.current = response.headers.get('Stream-ID') || null

            if (response && response.ok && response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let done = false
                let result = ''

                while (!done) {
                    const { value, done: doneReading } = await reader.read()
                    done = doneReading

                    if (stopGenerationRef.current) {
                        reader.cancel()
                        setIsLoading(false)
                        break
                    }

                    if (value) {
                        const chunk = decoder.decode(value, { stream: true })
                        const cleanedChunk = removeUnwantedChars(chunk)
                        result += cleanedChunk

                        addToken(cleanedChunk, false)

                        setSessions(prev => {
                            return prev.map(s => {
                                if (s.id === getSession().id) {
                                    return {
                                        ...s,
                                        completion: cleanedChunk
                                    }
                                }
                                return s
                            })
                        })
                        // autoScroll(!renderFullApp ? '.chat__main' : 'body')
                    }
                }

                if (outputRef.current) outputRef.current.innerHTML = ''

                setIsLoading(false)
                const time = timePassedRef.current
                const finalContent = removeUnwantedChars(result).replace('⬤', '') + (stopGenerationRef.current ? ' [STOPPED].' : '')
                const newMessage = {
                    role: 'assistant',
                    content: finalContent,
                    time,
                    stopped: stopGenerationRef.current || false
                }

                setSessions(prev => {
                    return prev.map(s => {
                        if (s.id === getSession().id) {
                            return {
                                ...s,
                                completion: null,
                                messages: [...s.messages, newMessage],
                                isLoading: false,
                                updated: new Date().getTime()
                            }
                        }
                        return s
                    })
                })

                setTimeout(() => {
                    setTimePassed(0)
                    renderCodeBlockHeaders()
                }, 100)
                streamIdRef.current = null
                stopGenerationRef.current = false

            } else {
                renderErrorResponse()
                console.error('Failed to fetch streamed answer')
            }
        } catch (error) {
            renderErrorResponse()
            console.error(error)
        }
    };


    const getModelSettings = async () => {
        try {
            const response = await fetch(`${apiURl}/api/get_model_settings`, { method: 'GET' })
            const settings = await response.json() || null

            return JSON.stringify(settings)
        } catch (error) {
            console.error(error)
        }
    }

    const renderErrorResponse = async () => {
        stopGenerationRef.current = false
        const time = timePassedRef.current
        setIsLoading(false)
        streamIdRef.current = null

        if (getSession().completion) {
            setSessions(prev => {
                return prev.map(s => {
                    if (s.id === getSession().id) {
                        return {
                            ...s,
                            completion: s.completion + '\n\n',
                            isLoading: false,
                            updated: new Date().getTime()
                        }
                    }
                    return s
                })
            })
        }

        const randomIndex = Math.floor(Math.random() * TECH_ISSUE_LLM.length)
        const issueResponse = TECH_ISSUE_LLM[randomIndex]
        let index = 0
        let chunk = getSession().completion || ''

        while (index < issueResponse.split(' ').length) {
            autoScroll(!renderFullApp ? '.chat__main' : 'body')
            const newToken = issueResponse.split(' ')[index]
            chunk += newToken + ' '

            addToken(newToken + ' ', false)

            setSessions(prev => {
                return prev.map(s => {
                    if (s.id === getSession().id) {
                        return {
                            ...s,
                            completion: chunk
                        }
                    }
                    return s
                })
            })
            await sleep(60)
            index++
        }

        if (outputRef.current) outputRef.current.innerHTML = ''

        const newMessage = {
            role: 'assistant',
            content: chunk,
            time,
            error: true
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    return {
                        ...s,
                        messages: [...s.messages, newMessage],
                        completion: null,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })
        setTimeout(() => setTimePassed(0), 100)
    }

    const createSession = () => {
        let newChatId = null
        sessions.forEach(s => {
            if (s.name === 'New chat' && !s.messages.length)
                newChatId = s.id
        })
        if (newChatId) {
            setSessionId(newChatId)
            return generateGreetings()
        }

        const newId = new Date().getTime()
        const newSession = {
            id: newId,
            messages: [],
            name: 'New chat',
            updated: newId
        }
        const updated = sessions.map(s => {
            if (s.name === 'New chat') return {
                ...s,
                name: `New chat [${new Date().toLocaleString('sv-SE')}]`
            }
            return s
        }).concat(newSession)
        setSessions(updated)
        setTimeout(() => {
            setSessionId(newId)
            generateGreetings()
        }, 100)
    }

    const resizeIframe = (h?: number, w?: number) => {
        const height = h || document.body.scrollHeight;
        const width = w || document.body.scrollWidth;
        window.parent.postMessage({ type: 'iframe_dim', height, width }, '*')
        const html = document.querySelector('html')
        if (html && h === POPUP_HEIGHT && w === POPUP_WIDTH) html.style.overflow = 'hidden'
        else if (html) html.style.overflow = 'unset'
    }

    const renderCodeBlockHeaders = () => {
        // const codeBlocks = Array.from(document.querySelectorAll('pre[class*="language-"]'))
        const codeBlocks = document.querySelectorAll('pre')

        codeBlocks.forEach((codeBlock, index) => {
            if (!codeBlock.hasAttribute("data-highlighted")) {
                const child = codeBlock.querySelector('code') as HTMLElement
                Prism.highlightElement(child)
                codeBlock.setAttribute("data-highlighted", "true")
            }

            if (!codeBlock.querySelector(".chat__code-header") || !codeBlock.querySelector(".chat__code-header--dark")) {
                const language = (codeBlock.outerHTML.split('"')[1] || 'code').replace('language-', '')

                const header = document.createElement('div')
                header.className = `chat__code-header`
                header.innerHTML = `<p class="chat__code-header-language">${language}</p>`

                const headerCopy = document.createElement('div')
                headerCopy.className = 'chat__code-header-copy'
                headerCopy.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="chat__code-header-copy-svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                    </svg>
                    <p class="chat__code-header-copy-text">Copy code</p>
                `
                headerCopy.onclick = () => copyCodeToClipboard(index)

                header.appendChild(headerCopy)
                codeBlock.prepend(header)
            }
        })

        // Making links on responses add new tab
        Array.from(document.querySelectorAll('.chat__message-bubble')).forEach(message => {
            Array.from(message.querySelectorAll('a')).forEach(anchor => {
                anchor.target = '_blank'
            })
        })
    }

    const generateGreetings = () => {
        const message = "Hi, what can I help you with today?"
        const promptSymbol = "⬤"
        let index = 0

        if (greetingsInterval.current) clearInterval(greetingsInterval.current)
        setGreetings(promptSymbol)

        greetingsInterval.current = setInterval(() => {
            if (index < message.length) {
                setGreetings(message.slice(0, index + 1) + promptSymbol)
                index++
            } else {
                clearInterval(greetingsInterval.current)
                setTimeout(() => {
                    setGreetings(message)
                }, 1000)
            }
        }, 50)
    }

    const stopGenerating = async () => {
        stopGenerationRef.current = true

        if (!streamIdRef.current) {
            console.error("No stream ID found. Cannot stop stream.");
            return;
        }

        try {
            const response = await fetch(`${apiURl}/api/prompt_route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                },
                body: new URLSearchParams({
                    stream_id: String(streamIdRef.current),
                    stop: 'true'
                }),
            })

            const data = await response.json()
            if (data.error) return console.error('An error occurred trying to stop chat response')

        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = (event: any) => {
        event.preventDefault()
        const content = input.trim()
        if (!content || isLoading || forbidSubmit()) return

        const newMessage = { role: 'user', content }
        const firstMessage = sessions.length === 1 && !getSession().messages.length
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id || prev.length === 1 && firstMessage) {
                    return {
                        ...s,
                        messages: [...s.messages, newMessage],
                        completion: null,
                        name: s.name !== 'New chat' ? s.name : newMessage.content,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })
        setInput('')
        setTimeout(() => autoScroll(!renderFullApp ? '.chat__main' : 'body'), 5)

        const isGreeting = greetingPatterns.includes(cleanText(content).toLowerCase())
        let isGratitude = gratitudePatterns.includes(cleanText(content).toLowerCase())

        if (isGreeting || isGratitude) return generateGreetingResponse(isGreeting ? 'greetings' : 'gratitude')

        getModelResponse(curatePrompt(content))
    }

    const curatePrompt = (userPrompt: string) => {
        let prompt = userPrompt
        const lastChar = prompt.split('')[prompt.length - 1]
        const firstWord = userPrompt.split(' ')[0].toLowerCase()
        if (lastChar !== '?' && lastChar !== '.' && questionStarters.includes(firstWord)) prompt += '?'

        const chatContext = needsContext(prompt) && sessionId ?
            instructionStart + memoryRef.current[sessionId].memory + instructionEnd : ''

        return chatContext + prompt
    }

    const generateGreetingResponse = async (type: 'greetings' | 'gratitude') => {
        const time = timePassedRef.current
        let index = 0
        let chunk = ''
        let textResponse = type === 'greetings' ?
            process.env.REACT_APP_GREETINGS_RESPONSE || `Hi! How may I help you today?`
            : process.env.REACT_APP_GRATITUDE_RESPONSE || 'You are welcome! Let me know how can I assist you further.'

        while (index < textResponse.split(' ').length) {
            autoScroll(!renderFullApp ? '.chat__main' : 'body')
            const newToken = textResponse.split(' ')[index]
            chunk += newToken + ' '

            addToken(newToken + ' ', false)

            setSessions(prev => {
                return prev.map(s => {
                    if (s.id === getSession().id) {
                        return {
                            ...s,
                            completion: chunk
                        }
                    }
                    return s
                })
            })
            await sleep(100)
            index++
        }

        if (outputRef.current) outputRef.current.innerHTML = ''

        const newMessage = {
            role: 'assistant',
            content: chunk,
            time
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    return {
                        ...s,
                        messages: [...s.messages, newMessage],
                        completion: null,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })
        setTimeout(() => setTimePassed(0), 100)
    }

    const resizeTextArea = (textarea: any) => {
        const { style } = textarea
        style.height = style.minHeight = 'auto'
        style.minHeight = `${Math.min(textarea.scrollHeight + 2, parseInt(textarea.style.maxHeight))}px`
        style.height = `${textarea.scrollHeight + 2}px`

        const form = document.querySelector(`.chat__form${theme}`) as HTMLDivElement
        const send = document.querySelectorAll(`.chat__form-send`) as NodeListOf<HTMLDivElement>
        const outputChat = document.querySelector(`.chat__output`) as HTMLDivElement

        form.style.alignItems = 'center'
        send.forEach(s => s.style.marginBottom = '0')

        outputChat.style.marginBottom = textarea.scrollHeight > 80 ? '46vh' : renderFullApp ? '6rem' : '0'
        if (textarea.scrollHeight > 60) {
            style.padding = '1rem 0'
            form.style.alignItems = 'flex-end'
            send.forEach(s => s.style.marginBottom = '.6rem')
        }
    }

    const copyCodeToClipboard: any = (index: number) => {
        const codeBlocks = Array.from(document.querySelectorAll('pre[class*="language-"]'))
        const codeBlock = (codeBlocks[index] as HTMLDivElement)
        const copyDiv = codeBlock.querySelector('.chat__code-header-copy')
        if (copyDiv && copyDiv.innerHTML.includes('Copy code')) {
            const prevHtml = copyDiv.innerHTML
            copyDiv.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="chat__code-header-copy-svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path>
                </svg>
                <p class="chat__code-header-copy-text">Copied!</p>
            `
            setTimeout(() => copyDiv.innerHTML = prevHtml, 2000)
        }

        const text = codeBlock.innerText.split('\n\nCopied!\n\n')[1].trim()

        navigator.clipboard.writeText(text)
    }

    const copyMessageToClipboard = (index: number) => {
        const text = (getSession().messages[index].content || '')
            .split('<br/><br/><strong>Sources:')[0]
            .replaceAll('\n\n', '\n').trim()

        navigator.clipboard.writeText(text).then(() => {
            setTimeout(() => setCopyMessage(index), 200)
            setTimeout(() => setCopyMessage(-1), 1500)
        }).catch((error) => {
            console.error('Failed to copy text: ', error);
        });
    }

    const scoreMessage = async (index: number, score: boolean) => {
        const scoredMessages = [...getSession().messages]
        scoredMessages[index].score = score
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    return {
                        ...s,
                        messages: scoredMessages
                    }
                }
                return s
            })
        })

        const modelSettings = await getModelSettings()

        const newFeedbackData = {
            ...feedbackData,
            ...getSession(),
            messages: [scoredMessages[index - 1] || {}, scoredMessages[index]],
            appVersion: APP_VERSION,
            session_id: getSession().id,
            score,
            createdAt: new Date().getTime(),
            modelSettings
        }

        setFeedbackData(newFeedbackData)
        if (score) await silentlySaveFeedback(newFeedbackData)

        setTimeout(() => score ? setGoodScore(index) : setBadScore(index), 100)
        setTimeout(() => score ? setGoodScore(-1) : setBadScore(-1), 1500)
    }

    const openInNewTab = () => {
        window.parent.postMessage({ height: POPUP_HEIGHT, width: POPUP_WIDTH }, '*')
        const anchor = document.createElement('a')
        // anchor.href = `${apiURl}?theme=${theme || 'false'}`
        anchor.href = `https://hpdevp.volvocars.net/More/veronica.html`
        anchor.target = '_blank'
        anchor.click()
    }

    const maximize = (e: any) => {
        if (e.isTrusted) {
            setTimeout(() => setMinimized(false), 100)
            window.parent.postMessage({ height: POPUP_WINDOW_HEIGHT, width: POPUP_WINDOW_WIDTH }, '*')
            resizeIframe(POPUP_WINDOW_HEIGHT, POPUP_WINDOW_WIDTH)
            setTimeout(() => {
                renderCodeBlockHeaders()
            }, 100)
            setPopupHeight('750px')
            setTimeout(() => autoScroll('.chat__main', 'smooth'), 200)
        }
    }

    const minimize = (e: any) => {
        if (e.isTrusted) {
            window.parent.postMessage({ height: POPUP_HEIGHT, width: POPUP_WIDTH }, '*')
            setTimeout(() => setMinimized(true), 100)
            setTimeout(() => setPopupHeight('60px'), 250)
            resizeIframe(POPUP_HEIGHT, POPUP_WIDTH)
        }
    }

    const renameSession = (id: number | null | undefined) => {
        setSessionNames({ [id || '']: getSession().name })
        setShowOptions(null)
        setTimeout(() => {
            (document.querySelector('.chat__panel-session-rename') as HTMLInputElement)?.focus()
        }, 100)
    }

    const updateSessionName = (e: any, id: number | null | undefined) => {
        const { value } = e.target
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        name: value || `New chat [${new Date(s.id || '').toLocaleString('sv-SE')}]`
                    }
                }
                return s
            })
        })
    }

    const deleteSession = (id: number | null | undefined, e: any) => {
        setShowOptions(null)
        const remainingSessions = sortArray(sessions.filter(s => s.id !== id), 'updated', true)
        if (remainingSessions.length && remainingSessions[0].messages.length) {
            setSessionId(remainingSessions[0].id)
            setSessions(remainingSessions)
        } else {
            const newId = new Date().getTime()
            const newSession = {
                id: newId,
                messages: [],
                name: 'New chat',
                updated: newId
            }
            setSessions([newSession])
            setTimeout(() => {
                setSessionId(newId)
                generateGreetings()
            }, 100)
        }
    }

    const exportSession = (id: number | null | undefined) => {
        setShowOptions(null)
        let sessionText = ''
        const sessionDate = new Date(id || new Date()).toLocaleString('sv-SE')
        const separator = '_________________________________________________________________\n\n\n'
        const sessionTitle = `HP Chatbot - Chat session "${getSession().name}" (${sessionDate})\n` + separator
        getSession().messages.map((m: messageType) => {
            sessionText += `${sessionText ? '' : sessionTitle}${m.role === 'user' ? '\n\n' : '\n'}${m.role === 'user' ? 'User' : 'Veronica'}: ${m.content}\n`
        })

        const blob = new Blob([sessionText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `HP Chatbot - ${getSession().name?.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '')}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const forbidSubmit = () => {
        return !input || (getSession().messages.length && getSession().messages[getSession().messages.length - 1].role === 'user')
    }

    const renderOptions = (id: number | null | undefined, event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        const positionY = window.innerHeight - event.clientY < 250 ? event.clientY - 155 : event.clientY - 15
        setSessionOptionStyles(prev => ({
            ...prev, [id || Math.random()]: {
                transform: `translateY(${positionY}px) translateX(-10px)`
            }
        }))
        setShowOptions(id)
    }

    const selectSession = (session: sessionType) => {
        setSessionId(session.id)
        setTimeout(() => autoScroll(!renderFullApp ? '.chat__main' : 'body'), 5)

        localStorage.setItem('currentSession', JSON.stringify(session.id))
    }

    const updateFeedbackData = (key: string, e: any) => {
        const value = e.target.value
        setFeedbackData({ ...feedbackData, [key]: value })
    }

    const updateLoginData = (key: string, e: any) => {
        const value = e.target.value
        setLoginData({ ...loginData, [key]: value })
    }

    const uploadDocuments = () => {
        const input = document.createElement('input') as HTMLInputElement
        input.type = 'file'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement)?.files?.[0]
            if (!file) return

            const formData = new FormData()
            formData.append("document", file)

            try {
                const response = await fetch('/api/save_document', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) toast.success('File(s) uploaded successfully')
                else toast.error('Error uploading file(s)')
            } catch (error) {
                toast.error('Error uploading file(s)')
                console.error("Error uploading file:", error)
            }
        }
        input.click()
        input.remove()
    }

    const resetMemory = () => {
        if (isLoading || !sessionId || !memoryRef.current[sessionId]) return
        if (resetMemoryRef.current) {
            resetMemoryRef.current.style.animation = 'transform-reload 1s ease-in'
            setTimeout(() => {
                if (resetMemoryRef.current) resetMemoryRef.current.style.animation = 'none'
            }, 1050)
        }
        const newMemory = {
            ...memoryRef.current,
            [sessionId]: {
                ...memoryRef.current[sessionId],
                memory: '',
                index: getSession().messages.length
            }
        }
        memoryRef.current = newMemory
        localStorage.setItem('memory', JSON.stringify(newMemory))
        toast.success('This conversation is now forgotten.')
    }

    const sendFeedback = async () => {
        try {
            setFeedbackData(prev => ({ ...prev, loading: true }))
            const response = await fetch(`${apiURl}/api/save_feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            })

            const responseData = await response.json()

            if (response.ok && responseData.message) {
                toast.success('Thank you! Your feedback has been sent.')
                setFeedbackData(null)
            } else toast.error('Error sending feedback. Please try again')

            setFeedbackData(prev => ({ ...prev, loading: false }))
        } catch (error) {
            setFeedbackData(prev => ({ ...prev, loading: false }))
            toast.error('Error sending feedback. Please try again')
        }
    }

    const silentlySaveFeedback = async (data: dataObj) => {
        try {
            await fetch(`${apiURl}/api/save_feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            setTimeout(() => setFeedbackData(null), 100)
        } catch (error) {
            setFeedbackData(null)
        }
    }

    const login = () => {
        const admins = process.env.REACT_APP_ADMIN || ''
        const isVerified = (loginData?.password === process.env.REACT_APP_TOKEN)
            && admins.includes(loginData?.cdsid)
        if (isVerified) {
            setLoginMessage('Welcome!')
            setIsLoggedIn(isVerified)
            localStorage.setItem('app_token', loginData?.password)
            setTimeout(() => {
                navigate('/admin')
            }, 1000)
        } else setLoginMessage('Login failed')
    }

    const handleChangeSearch = (e: any) => {
        const { value } = e.target
        if (value.trim()) setFilteredSessions([...sessions.filter(s => JSON.stringify(s).includes(value))])
        else setFilteredSessions(sessions)
    }

    const getResetMemoryTooltip = () => {
        return sessionId &&
            memoryRef.current[sessionId] ?
            memoryRef.current[sessionId].memory ?
                'Clear chat context' :
                'Chat context cleared' : ''
    }

    const goToAboutVeronica = (e: any) => {
        e.preventDefault()
        const a = document.createElement('a')
        a.href = `https://hpdevp.volvocars.net/More/about-veronica.html`
        a.target = `_blank`
        a.click()
        a.remove()
    }

    const renderSessionAge = (index: number) => {
        const sessions = [...filteredSessions]
        const currentSessionTime = new Date(sessions[index].updated || '').getTime()
        const currentSessionDay = new Date(sessions[index].updated || '').toLocaleDateString()
        const today = new Date().toLocaleDateString()
        const yesterday = new Date(new Date().getTime() - 86400000).toLocaleDateString() // minus 1 day in miliseconds
        const lastWeek = new Date().getTime() - 604800000
        const lastMonth = new Date().getTime() - 2505600000
        const lastYear = new Date().getTime() - 31449600000
        const prevSessionDay = sessions[index - 1] ? new Date(sessions[index - 1].updated || '').toLocaleDateString() : null
        const prevSessionTime = sessions[index - 1] ? new Date(sessions[index - 1].updated || '').getTime() : null

        const sessionAgeStyle = { marginTop: getSession().messages.length || sessions.length > 1 ? '' : '1rem' }

        if (currentSessionDay === prevSessionDay) return '' // Avoid repeat the age header
        if (currentSessionDay === today) return <p className='chat__panel-session-age' style={sessionAgeStyle}>Today</p>
        if (currentSessionDay === yesterday) return <p className='chat__panel-session-age' style={sessionAgeStyle}>Yesterday</p>

        if (currentSessionTime >= lastWeek
            && (!prevSessionDay || (prevSessionDay === today || prevSessionDay === yesterday))) {
            return <p className='chat__panel-session-age' style={sessionAgeStyle}>Last 7 Days</p>
        }
        if (currentSessionTime < lastWeek
            && (!prevSessionTime || prevSessionTime >= lastWeek)) {
            return <p className='chat__panel-session-age' style={sessionAgeStyle}>Previous Month</p>
        }

        if (currentSessionTime < lastMonth
            && (!prevSessionTime || prevSessionTime >= lastMonth)) {
            return <p className='chat__panel-session-age' style={sessionAgeStyle}>Last 12 Months</p>
        }

        if (currentSessionTime < lastYear
            && (!prevSessionTime || prevSessionTime >= lastYear)) {
            return <p className='chat__panel-session-age' style={sessionAgeStyle}>Older than a Year</p>
        }
        return ''
    }

    const renderFullAppSidebar = () => {
        return (
            <>
                <div
                    className="chat__panel"
                    style={{
                        background: theme ? '' : '#F9F9F9',
                        filter: feedbackData?.score === false ? 'blur(5px)' : '',
                        borderRadius: renderFullApp ? 0 : ''
                    }}>
                    <div className="chat__panel-form">
                        <div className="chat__panel-form-controls">
                            {!isMobile ?
                                <Tooltip tooltip='About Veronica' inline>
                                    <img onClick={goToAboutVeronica} src={theme ? HP_DARK : HP} alt='Ask Veronica' className={`chat__panel-logo`} style={{ padding: 0, height: '1.2rem', width: '1.2rem' }} draggable={false} />
                                </Tooltip> : ''}
                            {!isMobile && sessions.length > 1 ?
                                <SearchBar
                                    handleChange={handleChangeSearch}
                                    placeholder='Search chats...'
                                    triggerSearch={() => { }}
                                /> : ''}
                            {!isMobile && getSession().messages.length ?
                                <Tooltip tooltip='Start new chat' inline={sessions.length <= 1}>
                                    <img onClick={createSession} src={NewChat} alt="New Chat" draggable={false} className={`chat__panel-form-newchat${theme}`} />
                                </Tooltip>
                                : ''}
                        </div>
                        {isMobile ?
                            <div className="chat__popup-window-header-options" style={{ justifyContent: 'space-between' }}>
                                <img onClick={goToAboutVeronica} src={theme ? HP_DARK : HP} alt='Ask Veronica' className={`chat__panel-logo`} draggable={false} />
                                {getSession().messages.length ?
                                    <Tooltip tooltip='Start new chat' inline={sessions.length <= 1}>
                                        <img onClick={createSession} src={NewChat} alt="New Chat" draggable={false} className={`chat__panel-form-newchat${theme}`} />
                                    </Tooltip>
                                    : ''}
                                <Dropdown
                                    label=''
                                    options={[...filteredSessions].filter(s => s.name)}
                                    objKey='name'
                                    selected={getSession()}
                                    setSelected={selectSession}
                                    value={getSession()}
                                    style={{ width: '60vw', marginRight: '1rem' }}
                                />
                            </div>
                            :
                            <div className={`chat__panel-sessions${theme}`}>
                                {!filteredSessions.length && sessions.length ?
                                    <p style={{ fontSize: '.9rem' }}>No chats found.</p>
                                    :
                                    [...filteredSessions].map((s, i) =>
                                        s.name ?
                                            <div key={s.id}>
                                                {renderSessionAge(i)}
                                                <div
                                                    className={`chat__panel-session${theme}`}
                                                    onClick={() => selectSession(s)}
                                                    style={{
                                                        background: s.id === getSession().id ? theme ? '#2d2d2d' : '#e3e3e3' : '',
                                                        border: sessionNames[s.id || ''] || sessionNames[s.id || ''] === '' ? '1px solid blue' : ''
                                                    }}>
                                                    <div className="chat__panel-session-item">
                                                        {sessionNames[s.id || ''] || sessionNames[s.id || ''] === '' ?
                                                            <input
                                                                className='chat__panel-session-rename'
                                                                value={s.name}
                                                                onChange={e => updateSessionName(e, s.id)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') setSessionNames({})
                                                                }} />
                                                            : <p className='chat__panel-session-name'>{s.name}</p>}
                                                        {/* <p className='chat__panel-session-name'>{s.name}</p> */}
                                                        {showOptions ? '' : <img src={ChatOptions} onClick={(e) => renderOptions(s.id, e)} alt="Chat options" className="chat__panel-session-options-img" />}
                                                    </div>
                                                </div>
                                            </div>
                                            : ''
                                    )}
                            </div>}
                        {showOptions ?
                            <div className={`chat__panel-session-options${theme}`} style={sessionOptionStyles[showOptions] || {}}>
                                <div className={`chat__panel-session-option${theme}`} onClick={() => renameSession(showOptions)}>
                                    <img src={theme ? EditDark : Edit} alt="Rename" className={`chat__panel-session-option-img`} />
                                    <p className="chat__panel-session-option-text">Rename</p>
                                </div>
                                <div className={`chat__panel-session-option${theme}`} onClick={() => exportSession(showOptions)}>
                                    <img src={theme ? ExportDark : Export} alt="Rename" className={`chat__panel-session-option-img`} />
                                    <p className="chat__panel-session-option-text">Export</p>
                                </div>
                                <div className={`chat__panel-session-option${theme}`} onClick={e => deleteSession(showOptions, e)}>
                                    <img src={Trash} alt="Rename" className={`chat__panel-session-option-img`} />
                                    <p className="chat__panel-session-option-text" style={{ color: 'red' }}>Delete</p>
                                </div>
                            </div> : ''}
                    </div>
                    {isMobile ? '' : <p className='chat__panel-version'>v{APP_VERSION}</p>}
                </div>
                <div className="chat__panel-ghost" />
            </>
        )
    }

    const renderPopupHeader = () => {
        return (
            <div
                className="chat__popup-window-header"
                style={{
                    background: theme ? '' : '#f7f7f7',
                    borderBottom: theme ? '' : '1px solid #d3d3d399'
                }}>
                {/* {messages.length || Object.keys(localSessions).length ? <p className='chat__panel-hp-new' onClick={startNewChat}>New chat</p> : ''} */}
                <Tooltip tooltip='About Veronica'>
                    <div className="chat__popup-window-header-info">
                        <img onClick={goToAboutVeronica} src={theme ? HP_DARK : HP} alt="Veronica avatar" draggable={false} className={`chat__popup-window-header-image`} />
                        <div className="chat__popup-window-header-info-text">
                            <p onClick={goToAboutVeronica} className='chat__popup-window-header-title'>Veronica</p>
                            <p onClick={goToAboutVeronica} className="chat__popup-window-header-subtitle">HPx Assistant</p>
                        </div>
                    </div>
                </Tooltip>
                <div className="chat__popup-window-header-controls">
                    <div className="chat__popup-window-header-options">
                        <Dropdown
                            label=''
                            options={[...filteredSessions].filter(s => s.name)}
                            objKey='name'
                            selected={getSession()}
                            setSelected={selectSession}
                            value={getSession()}
                            style={{ width: '35vw' }}
                        />
                        <Tooltip tooltip='Start new chat'>
                            <img onClick={createSession} src={NewChat} alt="New Chat" draggable={false} className={`chat__popup-window-header-newchat${theme}`} />
                        </Tooltip>
                    </div>
                    <Tooltip tooltip='Full screen'>
                        <img src={NewTab} alt="Open in new tab" onClick={openInNewTab} style={{ height: '1.3rem', padding: '.5rem' }} className={`chat__popup-window-header-svg${theme}`} />
                    </Tooltip>
                    <Tooltip tooltip='Close'>
                        <img src={Close} alt="Close" onClick={minimize} className={`chat__popup-window-header-svg${theme}`} />
                    </Tooltip>
                </div>
            </div>
        )
    }

    const renderFeedbackModal = () => {
        return feedbackData ?
            <Modal
                title='What did I do wrong?'
                subtitle='Your feedback helps me get better 🙂'
                onClose={() => silentlySaveFeedback(feedbackData)}>
                <div className="chat__feedback-modal">
                    <div className="chat__feedback-content">
                        {feedbackData.messages.map((feedback: sessionType) => (
                            <div
                                key={feedback.id}
                                className={`chat__feedback-content-${feedback.role}${theme}`}
                                dangerouslySetInnerHTML={{
                                    __html: marked.parse(feedback.content || '') as string,
                                }} />
                        ))}
                    </div>
                    <div className="chat__feedback-buttons" style={{ marginBottom: '1rem', alignItems: 'flex-end' }}>
                        <InputField
                            label='Your full name or CDSID'
                            name='username'
                            updateData={updateFeedbackData}
                            value={feedbackData.username || ''}
                            style={{ width: '50%' }} />
                        <Dropdown
                            label='Fault type'
                            options={[
                                'Out of context / Hallucination',
                                'In context but wrong answer',
                                'Incomplete',
                                'Too long answer',
                                'Other (explain)'
                            ]}
                            value={feedbackData.type}
                            selected={feedbackData.type}
                            setSelected={value => updateFeedbackData('type', { target: { value } })}
                            style={{ width: '50%' }} />
                    </div>
                    <InputField
                        label='Your comments'
                        name='comments'
                        placeholder='Type your comments or a correct response'
                        updateData={updateFeedbackData}
                        type='textarea'
                        value={feedbackData.comments || ''}
                        rows={5}
                    />
                    <div className="chat__feedback-buttons">
                        <Button
                            label='Not now'
                            onClick={() => silentlySaveFeedback(feedbackData)}
                            style={{ fontSize: '1rem' }}
                            disabled={feedbackData.loading}
                        />
                        <Tooltip tooltip='Write some comments first' inline>
                            <Button
                                label='Send feedback'
                                disabled={!feedbackData.type || !feedbackData.username || feedbackData.loading}
                                onClick={sendFeedback}
                                className={`button__outline${theme}`}
                                style={{ fontSize: '1rem' }}
                            />
                        </Tooltip>
                    </div>
                </div>
            </Modal> : ''
    }

    const conversationContextMessage = (index: number) => {
        const currentMemory = sessionId && memoryRef.current && memoryRef.current[sessionId] ? memoryRef.current[sessionId] : null
        if (currentMemory && currentMemory.memory && currentMemory.index === index) {
            return <p key={currentMemory.memory} className={`chat__message-memory${theme}`}>Chat context</p>
        }
        return ''
    }

    const renderChatBox = () => {
        return (<div className="chat__box">
            <div className="chat__box-list">
                {!getSession().messages.length ?
                    <p className='chat__box-hi'>{greetings}</p>
                    : getSession().messages.map((message: dataObj, index: number) => (
                        <div key={index}>
                            {conversationContextMessage(index)}
                            <div className={`chat__message chat__message-${message.role || ''}`}>
                                {message.role === 'assistant' ? <img src={theme ? HP_DARK : HP} alt='Assistant Avatar' className={`chat__message-avatar`} draggable={false} /> : ''}
                                <div className={`chat__message-bubble chat__message-bubble-${message.role || ''}`}>
                                    <div
                                        className={`chat__message-content${theme} chat__message-content-${message.role || ''}`}
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(message.content || '') as string,
                                        }} />
                                    {message.sources && message.sources?.length > 0 && (
                                        <div className='chat__message-sources'>
                                            <p className="chat__message-sources-title">Sources:</p>
                                            {message.sources.map((source: dataObj) => (
                                                <p key={source.document.docId}>
                                                    <strong>
                                                        {source.document.docMetadata?.file_name as string}
                                                    </strong>
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {message.role === 'assistant' ?
                                        <div className="chat__message-controls">
                                            {copyMessage === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Copy'><svg onClick={() => copyMessageToClipboard(index)} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            {goodScore === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Good response'><svg onClick={() => scoreMessage(index, true)} style={{ stroke: message.score ? 'blue' : '', animationDelay: '.15s' }} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            {badScore === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Bad response'><svg onClick={() => scoreMessage(index, false)} style={{ stroke: message.score === false ? 'blue' : '', animationDelay: '.3s' }} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            {message.time && renderAdmin ? <span> ({message.time / 1000}s)</span> : ''}
                                        </div> : ''}
                                </div>
                            </div>
                        </div>
                    ))}

                <div
                    className='chat__message chat__message-assistant chat__message-completion'
                    style={{ display: outputRef.current && outputRef.current.innerHTML ? '' : 'none' }}>
                    <img src={theme ? HP_DARK : HP} alt='Assistant Avatar' className={`chat__message-avatar`} draggable={false} />
                    <div className="chat__message-bubble">
                        <div className={`chat__message-content${theme} chat__message-content-assistant`} ref={outputRef}>
                        </div>
                    </div>
                </div>
                {!outputRef.current?.innerHTML && isLoading && getSession().isLoading ?
                    <div className='chat__message chat__message-assistant chat__message-completion'>
                        <img src={theme ? HP_DARK : HP} alt='Assistant Avatar' className={`chat__message-avatar`} draggable={false} />
                        <div className="chat__message-bubble">
                            <div
                                className={`chat__message-content${theme} chat__message-content-assistant chat__message-loading`}
                                dangerouslySetInnerHTML={{
                                    __html: ' ⬤'
                                }}
                            />
                        </div>
                    </div> : ''}
            </div>
        </div>)
    }

    const renderLoginModal = () => {
        return (
            <Modal title='Login' onClose={(() => setShowLogin(false))}>
                <InputField
                    label='CDSID'
                    name='cdsid'
                    updateData={updateLoginData}
                    value={loginData?.cdsid}
                />
                <InputField
                    label='Password'
                    name='password'
                    type='password'
                    updateData={updateLoginData}
                    style={{ marginTop: '1rem' }}
                    value={loginData?.password}
                />
                {loginMessage ? <h3 style={{ color: loginMessage.includes('failed') ? 'brown' : 'darkgreen', marginBottom: 0 }}>{loginMessage}</h3> : ''}
                <Button
                    label='Login'
                    disabled={!loginData?.cdsid || !loginData?.password}
                    onClick={login}
                    className={`button__outline${theme}`}
                    style={{ fontSize: '1rem', marginTop: '2rem', width: '100%' }}
                />
            </Modal>
        )
    }

    const renderChatForm = () => {
        return (<div
            className={`chat__form-container${theme}`}
            style={{
                position: getSession().messages.length ? 'fixed' : 'unset',
                background: renderFullApp && theme ? '#14181E' : '',
                animation: getSession().messages.length ? 'none' : '',
                opacity: getSession().messages.length ? '1' : '',
                width: renderFullApp ? '800px' : '100%',
                margin: isMobile && !getSession().messages.length ? 0 : ''
            }}>
            {getSession().messages.length > 1 && sessionId && (!memoryRef.current[sessionId] || (memoryRef.current[sessionId] && memoryRef.current[sessionId].memory === '')) ?
                <div className='chat__message-memory-empty'>{!getSession().isLoading || !getSession().completion ?
                    <img src={NewContext} alt='New Context' draggable={false} className={`chat__message-memory-empty-svg${theme}`} />
                    : ''} {getSession().isLoading && getSession().completion ? 'Updating context...' : 'New chat context'}</div>
                : ''}

            <form className={`chat__form${theme}`} x-chunk="dashboard-03-chunk-1" onSubmit={handleSubmit}>
                {/* <div className="chat__form-attachment">
                    <svg className={`chat__form-attachment-svg${theme}`} onClick={uploadDocuments}
                        xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                        <path fill="#0F0F0F" d="M7 8.00092L7 17C7 17.5523 6.55228 18 6 18C5.44772 18 5.00001 17.4897 5 16.9374C5 16.9374 5 16.9374 5 16.9374C5 16.937 5.00029 8.01023 5.00032 8.00092C5.00031 7.96702 5.00089 7.93318 5.00202 7.89931C5.00388 7.84357 5.00744 7.76644 5.01426 7.67094C5.02788 7.4803 5.05463 7.21447 5.10736 6.8981C5.21202 6.27011 5.42321 5.41749 5.85557 4.55278C6.28989 3.68415 6.95706 2.78511 7.97655 2.10545C9.00229 1.42162 10.325 1 12 1C13.6953 1 14.9977 1.42162 16.0235 2.10545C17.0429 2.78511 17.7101 3.68415 18.1444 4.55278C18.5768 5.41749 18.788 6.27011 18.8926 6.8981C18.9454 7.21447 18.9721 7.4803 18.9857 7.67094C18.9926 7.76644 18.9961 7.84357 18.998 7.89931C18.9991 7.93286 18.9997 7.96641 19 7.99998C19.0144 10.7689 19.0003 17.7181 19 18.001C19 18.0268 18.9993 18.0525 18.9985 18.0782C18.9971 18.1193 18.9945 18.175 18.9896 18.2431C18.9799 18.3791 18.961 18.5668 18.9239 18.7894C18.8505 19.2299 18.7018 19.8325 18.3944 20.4472C18.0851 21.0658 17.6054 21.7149 16.8672 22.207C16.1227 22.7034 15.175 23 14 23C12.825 23 11.8773 22.7034 11.1328 22.207C10.3946 21.7149 9.91489 21.0658 9.60557 20.4472C9.29822 19.8325 9.14952 19.2299 9.07611 18.7894C9.039 18.5668 9.02007 18.3791 9.01035 18.2431C9.00549 18.175 9.0029 18.1193 9.00153 18.0782C9.00069 18.0529 9.00008 18.0275 9 18.0022C8.99621 15.0044 9 12.0067 9 9.00902C9.00101 8.95723 9.00276 8.89451 9.00645 8.84282C9.01225 8.76155 9.02338 8.65197 9.04486 8.5231C9.08702 8.27011 9.17322 7.91749 9.35558 7.55278C9.53989 7.18415 9.83207 6.78511 10.2891 6.48045C10.7523 6.17162 11.325 6 12 6C12.675 6 13.2477 6.17162 13.7109 6.48045C14.1679 6.78511 14.4601 7.18415 14.6444 7.55278C14.8268 7.91749 14.913 8.27011 14.9551 8.5231C14.9766 8.65197 14.9877 8.76155 14.9936 8.84282C14.9984 8.91124 14.9999 8.95358 15 8.99794L15 17C15 17.5523 14.5523 18 14 18C13.4477 18 13 17.5523 13 17V9.00902C12.9995 8.99543 12.9962 8.93484 12.9824 8.8519C12.962 8.72989 12.9232 8.58251 12.8556 8.44722C12.7899 8.31585 12.7071 8.21489 12.6015 8.14455C12.5023 8.07838 12.325 8 12 8C11.675 8 11.4977 8.07838 11.3985 8.14455C11.2929 8.21489 11.2101 8.31585 11.1444 8.44722C11.0768 8.58251 11.038 8.72989 11.0176 8.8519C11.0038 8.93484 11.0005 8.99543 11 9.00902V17.9957C11.0009 18.0307 11.0028 18.0657 11.0053 18.1006C11.0112 18.1834 11.0235 18.3082 11.0489 18.4606C11.1005 18.7701 11.2018 19.1675 11.3944 19.5528C11.5851 19.9342 11.8554 20.2851 12.2422 20.543C12.6227 20.7966 13.175 21 14 21C14.825 21 15.3773 20.7966 15.7578 20.543C16.1446 20.2851 16.4149 19.9342 16.6056 19.5528C16.7982 19.1675 16.8995 18.7701 16.9511 18.4606C16.9765 18.3082 16.9888 18.1834 16.9947 18.1006C16.9972 18.0657 16.9991 18.0307 17 17.9956L16.9999 7.99892C16.9997 7.98148 16.9982 7.91625 16.9908 7.81343C16.981 7.67595 16.9609 7.47303 16.9199 7.2269C16.837 6.72989 16.6732 6.08251 16.3556 5.44722C16.0399 4.81585 15.5821 4.21489 14.9141 3.76955C14.2523 3.32838 13.325 3 12 3C10.675 3 9.7477 3.32838 9.08595 3.76955C8.41793 4.21489 7.96011 4.81585 7.64443 5.44722C7.32678 6.08251 7.16298 6.72989 7.08014 7.2269C7.03912 7.47303 7.019 7.67595 7.00918 7.81343C7.0025 7.90687 7.00117 7.9571 7 8.00092Z" />
                    </svg>
                </div>  */}
                <textarea
                    ref={messageRef}
                    id="message"
                    placeholder="Type your message"
                    className={`chat__form-input${theme}`}
                    value={input}
                    name="content"
                    rows={1}
                    onKeyDown={(event) => {
                        if (!isLoading && event.key === 'Enter' && !event.shiftKey) {
                            handleSubmit(event)
                        }
                    }}
                    autoFocus
                    onChange={(event) => setInput(event.target.value)}
                    style={{
                        marginLeft: prod ? '1.5rem' : ''
                    }}
                />
                {sessionId && !memoryRef.current[sessionId] ? ''
                    : <Tooltip tooltip={getResetMemoryTooltip()} position='up'>
                        <div
                            className='chat__form-send'
                            onClick={resetMemory}
                            style={{
                                background: 'transparent',
                                cursor: isLoading || !sessionId || !memoryRef.current[sessionId] || !memoryRef.current[sessionId].memory ? 'not-allowed' : '',
                                marginRight: 0
                            }}>
                            <img
                                src={Reload}
                                ref={resetMemoryRef}
                                className={`chat__form-send-svg-reload${theme}`}
                                draggable={false}
                                style={{
                                    filter: !isLoading && sessionId && memoryRef.current[sessionId] && memoryRef.current[sessionId].memory ? theme ?
                                        'invert(96%) sepia(9%) saturate(0%) hue-rotate(172deg) brightness(91%) contrast(85%)'
                                        : 'none' : ''
                                }}
                            />
                        </div>
                    </Tooltip>}
                {isLoading ? getSession().isLoading ? (
                    <Tooltip tooltip='Stop generation' position='up'>
                        <div
                            className='chat__form-send'
                            onClick={stopGenerating}
                            style={{
                                background: theme ? 'lightgray' : 'black'
                            }}>
                            <svg className='chat__form-send-svg' style={{ padding: '.5rem' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="15" height="15" rx="1.25" fill={theme ? '#303030' : '#fff'}></rect></svg>
                        </div>
                    </Tooltip>
                ) : '' : (
                    <Tooltip tooltip={input ? 'Send message' : !renderFullApp ? '' : 'Write a message to send'} position='up'>
                        <div
                            className='chat__form-send'
                            style={{
                                background: input ? theme ? 'lightgray' : 'black' : theme ? 'gray' : '#d2d2d2',
                                cursor: forbidSubmit() ? 'not-allowed' : ''
                            }}
                            onClick={handleSubmit} >
                            <svg className='chat__form-send-svg' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill={theme ? '#303030' : '#fff'} fillRule="evenodd" clipRule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"></path>
                            </svg>
                        </div>
                    </Tooltip>
                )}
            </form>
        </div>)
    }

    return minimized ?
        <div className={`chat__popup-minimized${theme}`} onClick={maximize} style={{ height: popupHeight }}>
            <div className="chat__popup-logo">
                <img src={theme ? HP_DARK : HP} alt='Ask Veronica' className={`chat__popup-icon`} draggable={false} />
                <p className={`chat__popup-minimized-label${theme}`}>Ask<br />Veronica</p>
            </div>
        </div>
        :
        showLogin ? renderLoginModal() :
            <div
                className={`chat__container${theme}`}
                style={{
                    background: renderFullApp && theme ? '#14181E' : '',
                    height: renderFullApp ? '' : POPUP_WINDOW_HEIGHT
                }}>
                {/* <p className='chat__banner-message'>🚧 Currently on maintenance 🚧</p> */}
                {renderFullApp ? renderFullAppSidebar() : renderPopupHeader()}
                {!renderFullApp && getSession().messages.length ? <div style={{ height: '10vh' }} /> : ''}
                <main
                    className="chat__main"
                    style={{
                        justifyContent: getSession().messages.length ? 'flex-start' : 'center',
                        margin: !getSession().messages.length ? 'auto' : renderFullApp ? '' : '0 auto 10vh',
                        paddingTop: renderFullApp ? '' : '0vh',
                        paddingBottom: !renderFullApp && getSession().messages.length ? '9vh' : '',
                        overflowY: renderFullApp || !getSession().messages.length ? 'unset' : 'scroll',
                        overflowX: renderFullApp || !getSession().messages.length ? 'unset' : 'hidden',
                        height: !getSession().messages.length ? 'auto' : '',
                        width: renderFullApp ? '' : '100%'
                    }}>
                    <ToastContainer position="top-center" style={{ transform: 'none' }} theme={theme ? 'dark' : 'light'} autoClose={1500} />
                    {feedbackData?.score === false ? renderFeedbackModal() : ''}
                    <div
                        className="chat__output"
                        style={{
                            filter: feedbackData?.score === false ? 'blur(5px)' : '',
                            margin: !getSession().messages.length ? 'auto' : renderFullApp ? '' : '0 auto',
                            minHeight: renderFullApp ? '' : 'unset'
                        }}>
                        {renderChatBox()}
                        {feedbackData?.score === false ? '' : renderChatForm()}
                    </div>
                </main>
                {isMobile ? <p className='chat__panel-version'>v{APP_VERSION}</p> : ''}
            </div>
}
