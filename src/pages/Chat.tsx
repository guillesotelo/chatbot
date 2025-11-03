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
import Mic from '../assets/icons/mic.svg';
import PlusIcon from '../assets/icons/plus.svg';
import { BufferEntry, dataObj, messageType, sessionType } from '../types';
import { toast } from 'react-toastify';
import {
    APP_VERSION,
    commonWords,
    gratitudePatterns,
    greetingPatterns,
    instructionEnd,
    instructionStart,
    MAX_CHARS,
    NEW_USER_GREETINGS,
    pageReferences,
    POPUP_HEIGHT,
    POPUP_WIDTH,
    POPUP_WINDOW_HEIGHT,
    POPUP_WINDOW_WIDTH,
    questionStarters,
    referencePatterns,
    RETURNING_USER_GREETINGS,
    SOURCE_MAP,
    TECH_ISSUE_LLM,
    WELCOME_RESPONSES
} from '../constants/app';
import {
    autoScroll,
    checkPlantUML,
    cleanText,
    fixMarkdownLinks,
    fixPlantUML,
    getDate,
    normalizeVolvoIdentifier,
    sleep,
    sortArray
} from '../helpers';
import ChatOptions from '../assets/icons/options.svg'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from '../components/Tooltip';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import { useNavigate } from "react-router-dom";
import SearchBar from '../components/SearchBar';
import NewChat from '../assets/icons/new-chat.svg'
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"
import { BounceLoader } from 'react-spinners';
import plantumlEncoder from "plantuml-encoder";
import Switch from '../components/Switch';

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
const plantUmlServer = process.env.REACT_APP_PLANTUML_SERVER

export function Chat() {
    const [input, setInput] = useState('')
    const [copyMessage, setCopyMessage] = useState(-1)
    const [goodScore, setGoodScore] = useState(-1)
    const [badScore, setBadScore] = useState(-1)
    const [renderFullApp, setRenderFullApp] = useState(true) // Change to window.innerWidth > 1050 when ready to use popup mode
    const [renderAdmin, setRenderAdmin] = useState(false)
    const [minimized, setMinimized] = useState(false) // Set to default true only for production (to use the button) * default false fixes Firefox issue
    const [useDocumentContext, setUseDocumentContext] = useState(true)
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
    const [sendAnalytics, setSendAnalytics] = useState(true)
    const [currentPage, setCurrentPage] = useState('')
    const [source, setSource] = useState('')
    const [editedMessage, setEditedMessage] = useState('')
    const [showUserOptions, setShowUserOptions] = useState('')
    const [useMemory, setUseMemory] = useState(true)
    const [currentHref, setCurrentHref] = useState<{ href?: string, referenced?: boolean }>({})
    const { theme, setTheme, isMobile, isLoggedIn, setIsLoggedIn } = useContext(AppContext)
    const { transcript, listening, startListening, stopListening, speechAvailable } = useSpeechRecognition()
    const messageRef = useRef<HTMLTextAreaElement>(null)
    const stopwatchIntervalId = useRef<number | null>(null)
    const timePassedRef = useRef(timePassed)
    const stopGenerationRef = useRef(false)
    const streamIdRef = useRef<string | null>(null)
    const resetMemoryRef = useRef<null | HTMLImageElement>(null)
    const memoryRef = useRef<dataObj>({})
    const appUpdateRef = useRef<any>(null)
    const bufferRef = useRef<Record<string, BufferEntry>>({})
    const greetingsRef = useRef<HTMLDivElement>(null)
    const lastSubmittedRef = useRef("")
    const unnamedSessionRef = useRef<null | number>(null)
    const editingMessageRef = useRef<null | HTMLTextAreaElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const popup = new URLSearchParams(window.location.search).get('popup')
        const token = new URLSearchParams(window.location.search).get('token')
        const _theme = new URLSearchParams(window.location.search).get('theme')
        const login = new URLSearchParams(window.location.search).get('login')
        const analytics = new URLSearchParams(window.location.search).get('analytics')
        const from_source = new URLSearchParams(window.location.search).get('source')

        if (from_source) {
            const _source = (SOURCE_MAP as dataObj)[from_source] || 'HPx Assistant'
            setSource(_source)
            if (from_source === 'snok') setUseMemory(false)
        }

        if (popup) {
            setRenderFullApp(false)
            setMinimized(true)
            const body = document.querySelector('body')
            if (body) body.style.overflow = 'hidden'
        }
        if (token === process.env.REACT_APP_ADMIN_TOKEN) setRenderAdmin(true)
        if (_theme) setTheme(_theme !== 'false' ? '--dark' : '')
        if (analytics && analytics === 'false') setSendAnalytics(false)

        setShowLogin(Boolean(login))

        const hideSessionOptions = (e: any) => {
            if (e.target && e.target.className && typeof e.target.className === 'string' &&
                (!e.target.className.includes('chat__panel-session-option') || (e.target.className.includes('chat__panel-session-options-img') && unnamedSessionRef.current))
                && !e.target.className.includes('chat__panel-session-item')
                && !e.target.className.includes('chat__panel-session-rename')) {
                setShowOptions(null)
                if (unnamedSessionRef.current) {
                    updateSessionName({ target: { value: getDate(unnamedSessionRef.current) } }, unnamedSessionRef.current)
                    unnamedSessionRef.current = null
                }
                setSessionNames({})
            }
        }

        const getExternalData = (event: any) => {
            try {
                const { href } = event.data
                if (href) {
                    const splitUrl: string[] = href.split('/')
                    const current = (splitUrl.pop() || '').replace('.html', '').replace(/[-_]/g, ' ')
                    const context = splitUrl.map((p, i) => i > 2 ? p.replace(/[-_]/g, ' ') : false).filter(p => p).join(' - ')
                    const page = `"${current}" (${context})`
                    setCurrentPage(prev => page || prev || '')
                    setCurrentHref({ href })
                }
            } catch (error) {
                console.error(error)
            }
        }

        getLocalSessions(popup)
        checkForAppUpdates()

        window.addEventListener('message', getExternalData)
        document.addEventListener('click', hideSessionOptions)

        setSessionDate(new Date())

        if (messageRef.current) messageRef.current.focus()

        return () => {
            window.removeEventListener("message", getExternalData)
            document.removeEventListener('click', hideSessionOptions)
        }
    }, [])

    useEffect(() => {
        if (transcript && !listening && transcript !== lastSubmittedRef.current) {
            handleSubmit(null, transcript)
            lastSubmittedRef.current = transcript
        }
    }, [transcript, listening])

    // useEffect(() => {
    //     if (sessionId) console.log('memory', memoryRef.current[sessionId])
    // }, [memoryRef.current])

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
        if (messageRef.current) messageRef.current.focus()
        generateGreetings()
        runPostRender()
    }, [sessionId, feedbackData])

    useEffect(() => {
        updateSourceStyles()
    }, [theme])

    useEffect(() => {
        if (!minimized) {
            generateGreetings()
            runPostRender()
        }
    }, [minimized])

    const ensureBufferEntry = (id: string): BufferEntry => {
        return (bufferRef.current[id] ??= {
            el: null,
            streaming: false,
            sessionId: undefined
        })
    }

    const editMessage = (index: number) => {
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id || prev.length === 1) {
                    const message = [...s.messages].filter((m, i) => i === index)[0]?.content || ''
                    setEditedMessage(message)
                    return {
                        ...s,
                        messages: [...s.messages].map((m, i) => ({ ...m, edit: i === index })),
                    }
                }
                return s
            })
        })
    }

    const cancelEditMessage = () => {
        setEditedMessage('')
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id || prev.length === 1) {
                    return {
                        ...s,
                        messages: [...s.messages].map(m => ({ ...m, edit: false })),
                    }
                }
                return s
            })
        })
    }

    const regenerateResponse = (message: messageType) => {
        // 1. Replace both user message with edited and following assistant message with loading placeholder
        // 2. Completion occurs on given index+1 assistant placeholder
        // 3. Replace assistant completion with finished message in its place
        let assistantId: string | null = null
        let messageIndex = null
        const updatedMessages = [...getSession().messages].map((m, i, arr) => {
            if (m.id === message.id) {
                messageIndex = i
                // Regeneration from edited user message
                if (m.role === 'user') {
                    assistantId = arr[i + 1]?.id || null
                    return {
                        ...m,
                        content: editedMessage,
                        edit: false,
                        regenerated: Number((message.regenerated || 0) + 1),
                        date: new Date().getTime() // udpated datetime
                    }
                }
                // Regeneration of any assistant message
                else {
                    assistantId = m.id || null
                    return {
                        ...m,
                        regenerated: Number((message.regenerated || 0) + 1),
                    }
                }
            }
            // Fallback
            return m
        })

        const memoryMessages = messageIndex ? [...updatedMessages].slice(0, messageIndex) : [...updatedMessages]
        updateMemory(memoryMessages)

        const isFirstMessage = sessions.length === 1 && !getSession().messages.length
        let prevMessage: messageType = { id: '', content: '' }

        getSession().messages.forEach((m, i, arr) => {
            if (m.id === message.id) prevMessage = arr[i - 1] || null
        })

        const content = message.role === 'user' ? editedMessage : prevMessage?.content || ''

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id || prev.length === 1 && isFirstMessage) {
                    return {
                        ...s,
                        messages: [...updatedMessages],
                        completion: null,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })

        setTimeout(() => {
            if (message.edit) setEditedMessage('')
        }, 100)
        // setTimeout(() => autoScroll(!renderFullApp ? '.chat__main' : 'body'), 5)

        const isGreeting = greetingPatterns.includes(cleanText(content).toLowerCase())
        let isGratitude = gratitudePatterns.includes(cleanText(content).toLowerCase())

        if (isGreeting || isGratitude) return generateGreetingResponse(isGreeting ? 'greetings' : 'gratitude', assistantId || '', true)

        getModelResponse(curatePrompt(content), content, assistantId)
    }

    const needsContext = (userPrompt: string): boolean => {
        let matches = false
        if (sessionId && memoryRef.current[sessionId] && memoryRef.current[sessionId].memory) {
            const splittedPrompt = userPrompt.toLowerCase().match(/\b[a-zA-Z]+\b/g)
            const lastMessage = [...getSession().messages].reverse().filter(m => m.role === 'assistant')[0].content || ''
            const lastMessageSplit: string[] = lastMessage.split(' ')

            // Check for word-by-word matches between query and references
            referencePatterns.forEach(ref => {
                splittedPrompt?.forEach(word => {
                    if (ref && word && word.includes(ref)) {
                        matches = true
                    }
                })
            })

            // Check for word-by-word matches between the memory and the query
            lastMessageSplit.forEach(memoRef => {
                splittedPrompt?.forEach(word => {
                    if (memoRef && word && word == memoRef && !commonWords.includes(word)) {
                        matches = true
                    }
                })
            })
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
                        localStorage.setItem('tryUpdate', app_version)
                        console.log('Veronica just updated to the latest version: ', app_version)
                        if (!tryUpdate || tryUpdate !== app_version) window.location.reload()
                    } else {
                        console.log('Veronica version is the latest: ', app_version)
                    }
                }
            } catch (error) {
                console.error('An error occurred while updating Veronica version.')
            }
        }

        if (appUpdateRef.current) clearInterval(appUpdateRef.current)

        if (!window.location.href?.includes('localhost')) {
            checkAppVersion()
            appUpdateRef.current = setInterval(checkAppVersion, 600000)
        }
    }

    const updateMemory = (regeneratedMessages?: messageType[]) => {
        if (!useMemory || !sessionId || chatIsStreaming() || !memoryRef.current || !getSession().messages.length) return
        let chatContext = ['']
        const rMessages = [...(regeneratedMessages || getSession().messages)].reverse() // mutation from the original
        const getPrompt = (ctx: string[]) => instructionStart + ctx.join('') + instructionEnd // instructions + user prompt
        const currentMemory = memoryRef.current[sessionId] || null
        let index = regeneratedMessages?.length || currentMemory && (currentMemory.index || currentMemory.index === 0) ? currentMemory.index : rMessages.length // the actual index from the messages array (ordered)
        let rIndex = rMessages.length - index // reversed index, needed for our memory operation

        rMessages.forEach((m: dataObj, i: number) => {
            const message = `\n${m.role === 'assistant' ? m.content.split('<br/><br/><strong>Source')[0] : m.content}\n`
            if (m.content
                && getPrompt(chatContext.concat(message)).length <= MAX_CHARS
                && (i < rIndex || !currentMemory)
                && !TECH_ISSUE_LLM.includes(m.content)
                && !m.content.includes('[STOPPED]')
                && !m.content.includes(`Oops! It looks like I'm having a bit of a technical hiccup`)) {

                chatContext.unshift(message)
                index = rMessages.length - 1 - i

            } else if (i === 0 && getPrompt(chatContext.concat(message)).length >= MAX_CHARS) {
                // case when the last message only is very long, then we truncate it
                chatContext.unshift(message.split('').slice(0, MAX_CHARS).join('') + ' [...]')
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
                if (s.name === 'New chat' && !s.messages.length) newChatId = s.id
                if (!s.name) s.name = getDate(s.id || '')
                s.messages = [...s.messages].map(m => ({ ...m, edit: false, id: m.id || crypto.randomUUID() }))
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

    const curateResponse = (str: string) => {
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
        const stringWithoutPatterns = str.replace(regex, '')
        return fixMarkdownLinks(stringWithoutPatterns)
    }

    const addToken = async (id: string, tokenBuffer: string) => {
        const entry = ensureBufferEntry(id)
        if (entry.el) {
            if (!tokenBuffer && getSession().messages.length > 2) {
                entry.el.style.transition = '1s'
                entry.el.style.minHeight = renderFullApp ? '65vh' : '45vh'
                autoScroll(!renderFullApp ? '.chat__main' : 'body')
            }
            entry.el.classList.remove('chat__message-loading')
            entry.el.innerHTML = await marked.parse(tokenBuffer)
        }
    }

    const getPromptSubstract = (prompt: string) => {
        let subs = prompt.substring(0, 300)
        if (prompt.length > 300 && prompt.includes(instructionEnd)) {
            subs = `${prompt.replace(instructionStart, 'With context: "').substring(0, 100)}... [...]" Question: ${prompt.split(instructionEnd)[1]?.substring(0, 200)}`
        }
        return subs
    }

    const saveAnalytics = async (session: sessionType, prompt: string) => {
        try {
            if (!sendAnalytics) return null

            const duration_seconds = (new Date().getTime() - new Date(sessionDate || new Date()).getTime()) / 1000

            const analytics = {
                ...session,
                duration: 0,
                session_id: session.id,
                message_count: session.messages.length,
                token_count: prompt.length,
                prompt,
                duration_seconds
            }

            const response = await fetch(`${apiURl}/api/save_analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.REACT_APP_API_TOKEN || '' },
                body: JSON.stringify(analytics)
            })

        } catch (error) {
            console.error(error)
        }
    }

    const getModelResponse = async (content: string, unparsedContent: string, assistantId?: null | string) => {
        const messageId = assistantId || crypto.randomUUID()
        if (chatIsStreaming()) return

        const entry = ensureBufferEntry(messageId)
        entry.sessionId = getSession().id
        entry.streaming = true
        if (entry.el) entry.el.innerHTML = ' ⬤'

        // First we add an message placeholder in place (new message or regenerated)
        const newMessage = {
            id: messageId,
            role: 'assistant',
            content: ' ⬤',
            date: new Date().getTime()
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    const updatedMessages = assistantId ? [...s.messages].map(m => {
                        if (m.id === assistantId) return {
                            ...m,
                            ...newMessage
                        }
                        return m
                    }) : [...s.messages, newMessage]

                    return {
                        ...s,
                        messages: updatedMessages,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })

        try {
            const use_context = useDocumentContext ? 'true' : 'false'
            const first_query = getSession().messages.length <= 2 ? 'true' : ''

            const response = await fetch(`${apiURl}/api/prompt_route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                    'Authorization': process.env.REACT_APP_API_TOKEN || ''
                },
                body: new URLSearchParams({
                    user_prompt: content || '',
                    use_context,
                    first_query,
                    source,
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
                        entry.streaming = false
                        if (entry.el) entry.el.innerHTML = ''
                        break
                    }

                    if (value) {
                        const chunk = decoder.decode(value, { stream: true })
                        const cleanedChunk = curateResponse(chunk)
                        result += cleanedChunk

                        addToken(messageId, result)
                        // autoScroll(!renderFullApp ? '.chat__main' : 'body')
                    }
                }

                entry.streaming = false
                if (entry.el) entry.el.innerHTML = ''

                const time = timePassedRef.current
                const finalContent = curateResponse(result) + (stopGenerationRef.current ? ' [STOPPED].' : '')

                const updatedMessage = {
                    content: finalContent,
                    time,
                    stopped: stopGenerationRef.current || false,
                    date: new Date().getTime(),
                }

                let updatedSession: sessionType | null = null

                setSessions(prev => {
                    const currentSessionId = getSession().id;
                    const newSessions = prev.map(s => {
                        if (s.id === currentSessionId) {
                            const updatedMessages = s.messages.map(m =>
                                m.id === messageId
                                    ? { ...m, ...updatedMessage, regenerated: (m.regenerated || 0) + 1 }
                                    : m
                            )

                            updatedSession = {
                                ...s,
                                messages: updatedMessages,
                                updated: Date.now(),
                            }
                            return updatedSession
                        }
                        return s
                    })
                    return newSessions
                })

                if (updatedSession)  await saveAnalytics(updatedSession, unparsedContent)

                setTimeout(() => {
                    setTimePassed(0)
                    runPostRender(Boolean(assistantId))
                }, 100)

                streamIdRef.current = null
                stopGenerationRef.current = false

            } else {
                renderErrorResponse(messageId)
                console.error('Failed to fetch streamed answer')
            }

            entry.el?.classList.add('chat__message-loading')
        } catch (error) {
            renderErrorResponse(messageId)
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

    const renderErrorResponse = async (id: string) => {
        stopGenerationRef.current = false
        const time = timePassedRef.current
        streamIdRef.current = null
        const entry = ensureBufferEntry(id)

        if (entry.streaming && entry.el) {
            entry.el.textContent = entry.el.textContent + '\n\n'
        }

        const randomIndex = Math.floor(Math.random() * TECH_ISSUE_LLM.length)
        const errorRedirect = `\nPlease visit [Down@Volvo](${process.env.REACT_APP_ERROR_REDIRECT}) for more info.`
        const issueResponse = TECH_ISSUE_LLM[randomIndex] + errorRedirect
        let index = 0
        let chunk = getSession().completion || ''

        while (index < issueResponse.split(' ').length) {
            autoScroll(!renderFullApp ? '.chat__main' : 'body')
            const newToken = issueResponse.split(' ')[index]
            chunk += newToken + ' '
            addToken(id, chunk)
            await sleep(40)
            index++
        }

        entry.streaming = false
        if (entry.el) entry.el.innerHTML = ''

        const updatedMessage = {
            role: 'assistant',
            content: chunk,
            time,
            error: true,
            id: id || crypto.randomUUID(),
            date: new Date().getTime()
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    return {
                        ...s,
                        messages: [...s.messages].map(m => {
                            if (m.id === id) return {
                                ...m,
                                ...updatedMessage
                            }
                            return m
                        }),
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })
        setTimeout(() => setTimePassed(0), 100)
        entry.el?.classList.add('chat__message-loading')
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

    const runPostRender = (regenerated?: boolean) => {
        // Render code block headers
        // const codeBlocks = Array.from(document.querySelectorAll('pre[class*="language-"]'))
        const codeBlocks = document.querySelectorAll('pre')

        codeBlocks.forEach(async (codeBlock, index) => {

            if (!codeBlock.hasAttribute("data-highlighted")) {
                const child = codeBlock.querySelector('code') as HTMLElement
                Prism.highlightElement(child)
                codeBlock.setAttribute("data-highlighted", "true")
            }

            if (!codeBlock.parentElement?.className.includes('user') &&
                (!codeBlock.querySelector(".chat__code-header") || !codeBlock.querySelector(".chat__code-header--dark"))) {
                const language = (codeBlock.outerHTML.split('"')[1] || 'code').replace('language-', '')

                // PlantUML diagram render
                if (language.toLowerCase() === 'plantuml') {
                    let code = codeBlock.textContent || ''
                    code = code.includes('@startuml') ? code : `@startuml\n${code}\n@enduml`
                    const encoded = plantumlEncoder.encode(fixPlantUML(code))
                    // svg or png
                    const url = `${plantUmlServer}/svg/${encoded}`
                    const diagramOk = await checkPlantUML(url)
                    if (diagramOk) {
                        codeBlock.innerHTML = `<img style="max-width: 100%; margin: 1rem 0; border-radius: .3rem;" src="${url}" alt="PlantUML diagram" />`
                        codeBlock.style.background = 'transparent'
                        codeBlock.style.textAlign = 'center'
                        return
                    }
                }

                const header = document.createElement('div')
                header.className = `chat__code-header`
                header.innerHTML = `<p class="chat__code-header-language">${language}</p>`

                const headerCopy = document.createElement('div')
                headerCopy.className = 'chat__code-header-copy'
                headerCopy.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chat__code-header-copy-svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                    </svg>
                    <p class="chat__code-header-copy-text">Copy code</p>
                `
                headerCopy.onclick = () => copyCodeToClipboard(index)

                header.appendChild(headerCopy)
                codeBlock.prepend(header)
            }
        })

        // Apply source links styles
        Array.from(document.querySelectorAll('.chat__message-content-assistant')).forEach(message => {
            Array.from(message.querySelectorAll('strong')).forEach(s => {
                if (s.textContent?.includes('Source')) {
                    const header = document.createElement('p')
                    header.textContent = s.textContent
                    header.className = `chat__message-content-assistant-source-header`
                    s.replaceWith(header)
                }
            })

            Array.from(message.querySelectorAll('ul')).forEach(ul => {
                if (ul.previousElementSibling &&
                    (ul.previousElementSibling.outerHTML.includes('Source:')
                        || ul.previousElementSibling.outerHTML.includes('Sources:'))) {
                    const sourceList: string[] = []
                    Array.from(ul.querySelectorAll('a')).forEach(a => {
                        a.target = '_blank'
                        if (a.textContent) {
                            if (!a.hasAttribute('data-source-processed')) {
                                sourceList.push(a.href)
                                const title = document.createElement('p')
                                const subtitle = document.createElement('p')
                                title.className = `chat__message-content-assistant-source${theme}-title`
                                subtitle.className = `chat__message-content-assistant-source${theme}-subtitle`
                                a.className = `chat__message-content-assistant-source${theme}`

                                const parts = a.textContent.split('»').map(s => s.trim())
                                const titleText = parts.pop() || ''
                                const subtitleText = parts.join(' / ')
                                title.textContent = titleText
                                subtitle.textContent = subtitleText || 'HP Developer Portal'

                                a.setAttribute('data-source-processed', 'true')
                                a.replaceChildren(title, subtitle)
                            }
                        }
                    })
                    ul.style.listStyle = 'none';
                    ul.style.padding = '0';
                    const lastChild = Array.from(ul.querySelectorAll('li')).pop()
                    if (lastChild) lastChild.style.marginBottom = '.5rem'

                    // Add first source as current page, if user asked about it
                    if (currentHref.referenced && currentHref.href && !sourceList.includes(currentHref.href)) {
                        const li = document.createElement('li')
                        const currentPageSource = document.createElement('a')
                        const title = document.createElement('p')
                        const subtitle = document.createElement('p')
                        title.className = `chat__message-content-assistant-source${theme}-title`
                        subtitle.className = `chat__message-content-assistant-source${theme}-subtitle`
                        currentPageSource.className = `chat__message-content-assistant-source${theme}`
                        currentPageSource.href = currentHref.href
                        currentPageSource.target = '_blank'
                        const parts = currentHref.href.split('/').map(s => s.trim().replace('.html', ''))
                        const titleText = parts.pop() || ''
                        const subtitleText = parts.join(' / ')
                        title.textContent = titleText
                        subtitle.textContent = subtitleText || 'HP Developer Portal'
                        currentPageSource.setAttribute('data-source-processed', 'true')
                        currentPageSource.replaceChildren(title, subtitle)
                        li.appendChild(currentPageSource)
                        ul.prepend(li)
                    }
                }
            })
        })

        if (!regenerated) setTimeout(() => autoScroll(!renderFullApp ? '.chat__main' : 'body'), 5)
    }

    const updateSourceStyles = () => {
        Array.from(document.querySelectorAll('a')).forEach(a => {
            if (a.className.includes('chat__message-content-assistant-source')) {
                Array.from(a.querySelectorAll('p')).forEach(p => {
                    if (p.className.includes('subtitle')) p.className = `chat__message-content-assistant-source${theme}-subtitle`
                    else if (p.className.includes('title')) p.className = `chat__message-content-assistant-source${theme}-title`
                })
                a.className = `chat__message-content-assistant-source${theme}`
            }
        })
    }

    const generateGreetings = () => {
        if (messageRef.current) messageRef.current.focus()

        const firstUse = sessions.length <= 1
        const greetings = firstUse ? NEW_USER_GREETINGS : RETURNING_USER_GREETINGS
        const message = greetings[Math.floor(Math.random() * greetings.length)]

        if (greetingsRef.current) {
            greetingsRef.current.innerHTML = ''
            let delay = 0

            const words = message.split(" ")

            words.forEach((word, wi) => {
                const wordSpan = document.createElement("span");
                wordSpan.style.display = "inline-block"
                wordSpan.style.marginRight = "0.3em"

                word.split("").forEach((char) => {
                    const span = document.createElement("span")
                    span.textContent = char
                    span.classList.add("chat__box-greetings-letter")
                    wordSpan.appendChild(span)

                    setTimeout(() => {
                        span.classList.add("chat__box-greetings-letter--visible")
                    }, delay)

                    delay += 35
                })

                greetingsRef.current?.appendChild(wordSpan)
            })
        }
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
                    'Authorization': process.env.REACT_APP_API_TOKEN || ''
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

    const chatIsStreaming = () => {
        let stream = false
        Object.values(bufferRef.current).forEach(data => {
            if (data.streaming) stream = true
        })
        return stream
    }

    const sessionIsStreaming = () => {
        let stream = false
        Object.values(bufferRef.current).forEach(data => {
            if (data.streaming && data.sessionId === getSession().id) stream = true
        })
        return stream
    }

    const forbidSubmit = () => (!input.trim() && !transcript?.trim()) || chatIsStreaming() || editedMessage

    const handleSubmit = (event?: any, transcript?: string) => {
        event?.preventDefault()
        const content = transcript?.trim() || input.trim()
        if (forbidSubmit()) return
        const newId = crypto.randomUUID()

        const newMessage = {
            role: 'user',
            content,
            transcribed: Boolean(transcript?.trim()),
            context: Boolean(needsContext(content) && sessionId),
            id: newId,
            date: new Date().getTime()
        }

        const firstMessage = !getSession().messages.length

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id || prev.length === 1 && firstMessage) {
                    return {
                        ...s,
                        messages: [...s.messages, newMessage],
                        name: s.name === 'New chat' ? newMessage.content.substring(0, 80) : s.name,
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

        getModelResponse(curatePrompt(content), content)
    }

    const curatePrompt = (userPrompt: string) => {
        let prompt = normalizeVolvoIdentifier(userPrompt)

        pageReferences.forEach(reference => {
            if (currentPage && prompt.toLowerCase().includes(reference)) {
                prompt = prompt.replace(reference, `${reference} ${currentPage}`)
                setCurrentHref(prev => ({ ...prev, referenced: true }))
            }
        })

        const lastChar = prompt.split('')[prompt.length - 1]
        const firstWord = userPrompt.split(' ')[0].toLowerCase()
        if (lastChar !== '?' && lastChar !== '.' && questionStarters.includes(firstWord)) prompt += '?'

        const chatContext = needsContext(prompt) && sessionId ?
            instructionStart + memoryRef.current[sessionId].memory + instructionEnd : ''

        const promptLength = prompt.length
        const ctxLength = chatContext.length

        // Slice prompt is too large
        if (promptLength > MAX_CHARS) return prompt.substring(0, MAX_CHARS) + ' [...]'
        // Slice context if combo is large
        if (ctxLength && (promptLength + ctxLength) > MAX_CHARS) {
            const maxCtxLength = MAX_CHARS - promptLength
            const slicedCtx = chatContext.split(instructionEnd)[0].substring(0, maxCtxLength) + ' [...]' + instructionEnd
            return slicedCtx + prompt
        }

        return chatContext + prompt
    }

    const generateGreetingResponse = async (type: 'greetings' | 'gratitude', assistantId?: string, regenerated?: boolean) => {
        const firstUse = sessions.length <= 1
        const greetings = firstUse ? NEW_USER_GREETINGS : RETURNING_USER_GREETINGS
        const welcomeMessage = greetings[Math.floor(Math.random() * greetings.length)]
        const welcomeResponse = WELCOME_RESPONSES[Math.floor(Math.random() * WELCOME_RESPONSES.length)]
        const time = timePassedRef.current
        let index = 0
        let chunk = ''
        let textResponse = type === 'greetings' ? welcomeMessage : welcomeResponse

        const id = assistantId || crypto.randomUUID()

        const entry = ensureBufferEntry(id)
        entry.sessionId = getSession().id
        entry.streaming = true
        if (entry.el) entry.el.innerHTML = ' ⬤'

        const newMessage = {
            id,
            role: 'assistant',
            content: ' ⬤',
            date: new Date().getTime()
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    const updatedMessages = assistantId ? [...s.messages].map(m => {
                        if (m.id === assistantId) return {
                            ...m,
                            ...newMessage
                        }
                        return m
                    }) : [...s.messages, newMessage]

                    return {
                        ...s,
                        messages: updatedMessages,
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })

        while (index < textResponse.split(' ').length) {
            if (!regenerated) autoScroll(!renderFullApp ? '.chat__main' : 'body')
            const newToken = textResponse.split(' ')[index]
            chunk += newToken + ' '
            addToken(id, chunk)
            await sleep(60)
            index++
        }

        entry.streaming = false
        if (entry.el) entry.el.innerHTML = ''

        const updatedMessage = {
            role: 'assistant',
            content: chunk,
            time,
            id,
            date: new Date().getTime()
        }

        setSessions(prev => {
            return prev.map(s => {
                if (s.id === getSession().id) {
                    return {
                        ...s,
                        messages: [...s.messages].map(m => {
                            if (m.id === id) return {
                                ...m,
                                ...updatedMessage
                            }
                            return m
                        }),
                        updated: new Date().getTime()
                    }
                }
                return s
            })
        })
        setTimeout(() => setTimePassed(0), 100)
        entry.el?.classList.add('chat__message-loading')
    }

    const resizeEditingMessage = () => {
        if (editingMessageRef.current) {
            const { style } = editingMessageRef.current
            style.height = style.minHeight = 'auto'
            style.minHeight = `${Math.min(editingMessageRef.current.scrollHeight + 2, parseInt(editingMessageRef.current.style.maxHeight))}px`
            style.height = `${editingMessageRef.current.scrollHeight + 2}px`
        }
    }

    const resizeTextArea = (textarea: any) => {
        const { style } = textarea
        style.height = style.minHeight = 'auto'
        style.minHeight = `${Math.min(textarea.scrollHeight + 2, parseInt(textarea.style.maxHeight))}px`
        style.height = `${textarea.scrollHeight + 2}px`

        const form = document.querySelector(`.chat__form${theme}`) as HTMLDivElement
        const sendBtn = document.querySelectorAll(`.chat__form-send`) as NodeListOf<HTMLDivElement>
        const speakBtn = document.querySelector(`.chat__form-control-svg${theme}`) as HTMLDivElement
        const outputChat = document.querySelector(`.chat__output`) as HTMLDivElement
        const greetings = document.querySelector(`.chat__box-greetings`) as HTMLDivElement
        const output = document.querySelector(`.chat__output`) as HTMLDivElement

        form.style.alignItems = 'center'
        sendBtn.forEach(s => s.style.marginBottom = '0')
        if (speakBtn) speakBtn.style.marginBottom = '0'

        outputChat.style.marginBottom = textarea.scrollHeight > 80 ? '46vh' : renderFullApp ? '6rem' : '0'
        if (textarea.scrollHeight > 60) {
            style.padding = '1rem 0 0 1.2rem'
            style.marginBottom = '1rem'
            form.style.alignItems = 'flex-end'
            sendBtn.forEach(s => s.style.marginBottom = '.6rem')
            if (speakBtn) speakBtn.style.marginBottom = '.4rem'

            if (getSession().messages.length < 2) {
                // greetings.style.marginBottom = '4rem'
                outputChat.style.gap = '2rem'
                output.style.marginBottom = '0'
            }
        }
    }

    const copyCodeToClipboard: any = (index: number) => {
        const codeBlocks = Array.from(document.querySelectorAll('pre[class*="language-"]'))
        const codeBlock = (codeBlocks[index] as HTMLDivElement)
        const copyDiv = codeBlock.querySelector('.chat__code-header-copy')
        if (copyDiv && copyDiv.innerHTML.includes('Copy code')) {
            const prevHtml = copyDiv.innerHTML
            copyDiv.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="chat__code-header-copy-svg">
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
            conversation: JSON.stringify(getSession().messages),
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
        anchor.href = `${process.env.REACT_APP_FULL_APP}`
        anchor.target = '_blank'
        anchor.click()
    }

    const maximize = (e: any) => {
        if (e.isTrusted) {
            setTimeout(() => setMinimized(false), 100)
            window.parent.postMessage({ height: POPUP_WINDOW_HEIGHT, width: POPUP_WINDOW_WIDTH }, '*')
            resizeIframe(POPUP_WINDOW_HEIGHT, POPUP_WINDOW_WIDTH)
            setTimeout(() => {
                runPostRender()
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
        unnamedSessionRef.current = value || !id ? null : id
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        name: value
                    }
                }
                return s
            })
        })
    }

    const deleteSession = (id: number | null | undefined, e: any) => {
        if (sessions.length) {
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
    }

    const exportSession = (id: number | null | undefined) => {
        setShowOptions(null)
        let sessionText = ''
        const sessionDate = new Date(id || new Date()).toLocaleString('sv-SE')
        const separator = '_________________________________________________________________\n\n\n'
        const sessionTitle = `Veronica - Chat session "${getSession().name}" (${sessionDate})\n` + separator
        getSession().messages.map((m: messageType) => {
            sessionText += `${sessionText ? '' : sessionTitle}${m.role === 'user' ? '\n\n' : '\n'}${m.role === 'user' ? 'User' : 'Veronica'}: ${m.content}\n`
        })

        const blob = new Blob([sessionText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Veronica - ${getSession().name?.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '')}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
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
        if (sessionIsStreaming() || !sessionId || !memoryRef.current[sessionId]) return
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
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.REACT_APP_API_TOKEN || '' },
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
                headers: { 'Content-Type': 'application/json', 'Authorization': process.env.REACT_APP_API_TOKEN || '' },
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
        else setFilteredSessions(sortArray(sessions, 'updated', true))
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
        a.href = `${process.env.REACT_APP_ABOUT_PAGE}`
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
                        {!isMobile && source === 'snok' ?
                            <Switch
                                label='Memory'
                                on='On'
                                off='Off'
                                value={useMemory}
                                setValue={setUseMemory}
                                style={{ marginTop: '1rem' }}
                            />
                            : ''}
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
                                                                if (e.key === 'Enter' && !unnamedSessionRef.current) setSessionNames({})
                                                            }} />
                                                        : <p className='chat__panel-session-name'>{s.name}</p>}
                                                    {/* <p className='chat__panel-session-name'>{s.name}</p> */}
                                                    {showOptions ? '' : <img src={ChatOptions} onClick={(e) => renderOptions(s.id, e)} alt="Chat options" className="chat__panel-session-options-img" />}
                                                </div>
                                            </div>
                                        </div>
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
                            <p onClick={goToAboutVeronica} className="chat__popup-window-header-subtitle">{source || 'HPx Assistant'}</p>
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
                            noBorder
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
                                    __html: feedback.role === 'user' ? feedback.content.replace(/\n/g, "<br>") : marked.parse(feedback.content || '') as string,
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

    const renderCompletion = (message: messageType) => bufferRef.current && bufferRef.current[message.id] && bufferRef.current[message.id].streaming

    const renderChatBox = () => {
        return (<div className="chat__box">
            <div className="chat__box-list">
                {!getSession().messages.length ?
                    <p ref={greetingsRef} className='chat__box-greetings'></p>
                    : getSession().messages.map((message: messageType, index: number, arr) => (
                        <div key={message.id}>
                            {/* {conversationContextMessage(index)} */}
                            <div className={`chat__message chat__message-${message.role || ''}`} style={{ display: renderCompletion(message) ? 'none' : '' }}>
                                {message.role === 'assistant' ?
                                    <img src={theme ? HP_DARK : HP} alt='Assistant Avatar' className={`chat__message-avatar`} draggable={false} />
                                    : ''}
                                <div
                                    className={`chat__message-bubble chat__message-bubble-${message.role || ''}`}
                                    onMouseEnter={() => setShowUserOptions(message.id)}
                                    onMouseLeave={() => setShowUserOptions('')}
                                    style={{
                                        width: message.edit ? '92%' : '',
                                        maxWidth: message.edit ? 'unset' : '',
                                        paddingBottom: !message.edit && showUserOptions !== message.id && message.role === 'user' ? '1.9rem' : ''
                                    }}>
                                    {message.edit ?
                                        <div className={`chat__message-content${theme} chat__message-content-user chat__message-edit`}>
                                            <textarea
                                                name='message-edit'
                                                className={`chat__message-edit-input`}
                                                value={editedMessage}
                                                ref={editingMessageRef}
                                                autoFocus
                                                onFocus={(e) => {
                                                    const tempValue = e.target.value
                                                    e.target.value = ''
                                                    e.target.value = tempValue
                                                }}
                                                onChange={e => {
                                                    setEditedMessage(e.target.value)
                                                    resizeEditingMessage()
                                                }} />
                                            <div className={`chat__message-edit-buttons`}>
                                                <button className={`chat__message-edit-cancel${theme}`} onClick={cancelEditMessage}>Cancel</button>
                                                <button className={`chat__message-edit-send${theme}`} onClick={() => regenerateResponse(message)} disabled={!editedMessage}>Send</button>
                                            </div>
                                        </div>
                                        :
                                        <div
                                            className={`chat__message-content${theme} chat__message-content-${message.role || ''}`}
                                            dangerouslySetInnerHTML={{
                                                __html: message.role === 'user' ? String(message.content).replace(/\n/g, "<br>") : marked.parse(message.content || '') as string,
                                            }} />
                                    }
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
                                    {message.role === 'assistant' && !renderCompletion(message) && !sessionIsStreaming() ?
                                        <div className="chat__message-controls">
                                            {copyMessage === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Copy'>
                                                    <svg onClick={() => copyMessageToClipboard(index)} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            {goodScore === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Good response'>
                                                    <svg onClick={() => scoreMessage(index, true)} style={{ stroke: message.score ? 'blue' : '', animationDelay: '.15s' }} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            {badScore === index ?
                                                <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                : <Tooltip tooltip='Bad response'>
                                                    <svg onClick={() => scoreMessage(index, false)} style={{ stroke: message.score === false ? 'blue' : '', animationDelay: '.3s' }} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z" fill="currentColor"></path></svg>
                                                </Tooltip>
                                            }
                                            <Tooltip tooltip='Try again'>
                                                <svg onClick={() => regenerateResponse(message)} width="24" height="24" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ animationDelay: '.45s' }} className={`chat__message-copy${theme}`}><path d="M3.502 16.6663V13.3333C3.502 12.9661 3.79977 12.6683 4.16704 12.6683H7.50004L7.63383 12.682C7.93691 12.7439 8.16508 13.0119 8.16508 13.3333C8.16508 13.6547 7.93691 13.9227 7.63383 13.9847L7.50004 13.9984H5.47465C6.58682 15.2249 8.21842 16.0013 10 16.0013C13.06 16.0012 15.5859 13.711 15.9551 10.7513L15.9854 10.6195C16.0845 10.3266 16.3785 10.1334 16.6973 10.1732C17.0617 10.2186 17.3198 10.551 17.2745 10.9154L17.2247 11.2523C16.6301 14.7051 13.6224 17.3313 10 17.3314C8.01103 17.3314 6.17188 16.5383 4.83208 15.2474V16.6663C4.83208 17.0335 4.53411 17.3311 4.16704 17.3314C3.79977 17.3314 3.502 17.0336 3.502 16.6663ZM4.04497 9.24935C3.99936 9.61353 3.66701 9.87178 3.30278 9.8265C2.93833 9.78105 2.67921 9.44876 2.72465 9.08431L4.04497 9.24935ZM10 2.66829C11.9939 2.66833 13.8372 3.46551 15.1778 4.76204V3.33333C15.1778 2.96616 15.4757 2.66844 15.8428 2.66829C16.2101 2.66829 16.5079 2.96606 16.5079 3.33333V6.66634C16.5079 7.03361 16.2101 7.33138 15.8428 7.33138H12.5098C12.1425 7.33138 11.8448 7.03361 11.8448 6.66634C11.8449 6.29922 12.1426 6.0013 12.5098 6.0013H14.5254C13.4133 4.77488 11.7816 3.99841 10 3.99837C6.93998 3.99837 4.41406 6.28947 4.04497 9.24935L3.38481 9.16634L2.72465 9.08431C3.17574 5.46702 6.26076 2.66829 10 2.66829Z"></path></svg>
                                            </Tooltip>
                                            {message.time && renderAdmin ? <span> ({message.time / 1000}s)</span> : ''}
                                        </div> :
                                        message.role === 'user' && !message.edit ?
                                            <div className="chat__message-controls" style={{ justifyContent: 'flex-end' }}>
                                                {copyMessage === index ?
                                                    <svg className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.0633 5.67387C18.5196 5.98499 18.6374 6.60712 18.3262 7.06343L10.8262 18.0634C10.6585 18.3095 10.3898 18.4679 10.0934 18.4957C9.79688 18.5235 9.50345 18.4178 9.29289 18.2072L4.79289 13.7072C4.40237 13.3167 4.40237 12.6835 4.79289 12.293C5.18342 11.9025 5.81658 11.9025 6.20711 12.293L9.85368 15.9396L16.6738 5.93676C16.9849 5.48045 17.607 5.36275 18.0633 5.67387Z" fill="currentColor"></path></svg>
                                                    : <Tooltip tooltip='Copy' style={{ display: showUserOptions === message.id ? '' : 'none' }}>
                                                        <svg onClick={() => copyMessageToClipboard(index)} className={`chat__message-copy${theme}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>
                                                    </Tooltip>
                                                }
                                                {!sessionIsStreaming() ?
                                                    <Tooltip tooltip='Edit' style={{ display: showUserOptions === message.id ? '' : 'none' }}>
                                                        <svg onClick={() => editMessage(index)} width="24" height="24" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ animationDelay: '.1s' }} className={`chat__message-copy${theme}`}><path d="M11.3312 3.56837C12.7488 2.28756 14.9376 2.33009 16.3038 3.6963L16.4318 3.83106C17.6712 5.20294 17.6712 7.29708 16.4318 8.66895L16.3038 8.80372L10.0118 15.0947C9.68833 15.4182 9.45378 15.6553 9.22179 15.8457L8.98742 16.0225C8.78227 16.1626 8.56423 16.2832 8.33703 16.3828L8.10753 16.4756C7.92576 16.5422 7.73836 16.5902 7.5216 16.6348L6.75695 16.7705L4.36339 17.169C4.22053 17.1928 4.06908 17.2188 3.94054 17.2285C3.84177 17.236 3.70827 17.2386 3.56261 17.2031L3.41417 17.1543C3.19115 17.0586 3.00741 16.8908 2.89171 16.6797L2.84581 16.5859C2.75951 16.3846 2.76168 16.1912 2.7716 16.0596C2.7813 15.931 2.80736 15.7796 2.83117 15.6367L3.2296 13.2432L3.36437 12.4785C3.40893 12.2616 3.45789 12.0745 3.52453 11.8926L3.6173 11.6621C3.71685 11.4352 3.83766 11.2176 3.97765 11.0127L4.15343 10.7783C4.34386 10.5462 4.58164 10.312 4.90538 9.98829L11.1964 3.6963L11.3312 3.56837ZM5.84581 10.9287C5.49664 11.2779 5.31252 11.4634 5.18663 11.6162L5.07531 11.7627C4.98188 11.8995 4.90151 12.0448 4.83507 12.1963L4.77355 12.3506C4.73321 12.4607 4.70242 12.5761 4.66808 12.7451L4.54113 13.4619L4.14269 15.8555L4.14171 15.8574H4.14464L6.5382 15.458L7.25499 15.332C7.424 15.2977 7.5394 15.2669 7.64953 15.2266L7.80285 15.165C7.95455 15.0986 8.09947 15.0174 8.23644 14.9238L8.3839 14.8135C8.53668 14.6876 8.72225 14.5035 9.0714 14.1543L14.0587 9.16602L10.8331 5.94044L5.84581 10.9287ZM15.3634 4.63673C14.5281 3.80141 13.2057 3.74938 12.3097 4.48048L12.1368 4.63673L11.7735 5.00001L15.0001 8.22559L15.3634 7.86329L15.5196 7.68946C16.2015 6.85326 16.2015 5.64676 15.5196 4.81056L15.3634 4.63673Z"></path></svg>
                                                    </Tooltip>
                                                    : ''}
                                            </div>
                                            :
                                            ''}
                                </div>
                            </div>
                            <div
                                className='chat__message chat__message-assistant chat__message-completion'
                                style={{
                                    display: renderCompletion(message) ? '' : 'none'
                                }}>
                                <img src={theme ? HP_DARK : HP} alt='Assistant Avatar' className={`chat__message-avatar`} draggable={false} />
                                <div className="chat__message-bubble">
                                    <div
                                        className={`chat__message-content${theme} chat__message-content-assistant chat__message-loading`}
                                        ref={(el) => {
                                            const entry = ensureBufferEntry(message.id)
                                            entry.el = el
                                            if (el && entry.streaming) {
                                                el.innerHTML = ' ⬤'
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
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
            {/* CONTEXT ICON */}
            {/* {getSession().messages.length > 1 && sessionId && (!memoryRef.current[sessionId] || (memoryRef.current[sessionId] && memoryRef.current[sessionId].memory === '')) ?
                <div className='chat__message-memory-empty'>
                    {!getSession().isLoading || !getSession().completion ?
                        <img src={NewContext} alt='New Context' draggable={false} className={`chat__message-memory-empty-svg${theme}`} />
                        : ''} {getSession().isLoading && getSession().completion ? 'Updating context...' : 'New chat context'}
                </div>
                : ''} */}

            <form className={`chat__form${theme}`} x-chunk="dashboard-03-chunk-1" onSubmit={handleSubmit}>
                {/* {chatIsStreaming() ? '' :
                <Tooltip tooltip={'Upload file'} position='up'>
                    <div className="chat__form-control">
                        <img src={PlusIcon} draggable={false} className={`chat__form-control-svg${theme}`} onClick={uploadDocuments} />
                    </div>
                </Tooltip>} */}
                <textarea
                    ref={messageRef}
                    id="message"
                    placeholder="Type your message"
                    className={`chat__form-input${theme}`}
                    value={input}
                    name="content"
                    rows={1}
                    onKeyDown={(event) => {
                        if (!chatIsStreaming() && event.key === 'Enter' && !event.shiftKey) {
                            handleSubmit(event)
                        }
                    }}
                    autoFocus
                    onChange={(event) => setInput(event.target.value)}
                    disabled={Boolean(editedMessage)}
                />
                {/* CHAT CONTEXT BUTTON (RESET CONTEXT) */}
                {/* {sessionId && !memoryRef.current[sessionId] ? ''
                    : <Tooltip tooltip={getResetMemoryTooltip()} position='up'>
                        <div
                            className='chat__form-send'
                            onClick={resetMemory}
                            style={{
                                background: 'transparent',
                                cursor: isLoading[sessionId || ''] || !sessionId || !memoryRef.current[sessionId] || !memoryRef.current[sessionId].memory ? 'not-allowed' : '',
                                marginRight: 0
                            }}>
                            <img
                                src={Reload}
                                ref={resetMemoryRef}
                                className={`chat__form-send-svg-reload${theme}`}
                                draggable={false}
                                style={{
                                    filter: !isLoading[sessionId || ''] && sessionId && memoryRef.current[sessionId] && memoryRef.current[sessionId].memory ? theme ?
                                        'invert(96%) sepia(9%) saturate(0%) hue-rotate(172deg) brightness(91%) contrast(85%)'
                                        : 'none' : ''
                                }}
                            />
                        </div>
                    </Tooltip>} */}
                {speechAvailable ?
                    <Tooltip tooltip={chatIsStreaming() ? 'Wait for response' : listening ? 'Listening...' : 'Speak'} position='up'>
                        <div
                            className='chat__form-control'
                            // onClick={listening ? stopListening : (!isLoading[sessionId || ''] || !getSession().isLoading) ? startListening : undefined}
                            onClick={!chatIsStreaming() && !editedMessage ? () => {
                                lastSubmittedRef.current = ''
                                startListening()
                            } : undefined}
                            style={{
                                background: 'transparent',
                                marginRight: 0
                            }}>
                            {listening ?
                                <BounceLoader size={24} color={theme ? '#ffffffff' : '#000000ff'} speedMultiplier={0.75} />
                                :
                                <img
                                    src={Mic}
                                    className={`chat__form-control-svg${theme}${chatIsStreaming() ? '--loading' : ''}`}
                                    style={{ cursor: chatIsStreaming() || Boolean(editedMessage) ? 'not-allowed' : '' }}
                                    draggable={false}
                                />
                            }
                        </div>
                    </Tooltip>
                    : ''
                }
                {sessionIsStreaming() ? (
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
                ) : (
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
                {isMobile ? <p className='chat__panel-version'>v{APP_VERSION} • Veronica may be inaccurate. Verify important details.</p> : ''}
            </div>
}
