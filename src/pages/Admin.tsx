import React, { useContext, useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import { feedbackHeaders } from '../constants/app'
import { dataObj, sessionType } from '../types'
import { AppContext } from '../AppContext'
import { useNavigate } from 'react-router-dom'
import { sortArray } from '../helpers'
import InputField from '../components/InputField'
import { Button } from '../components/Button'
import { toast, ToastContainer } from 'react-toastify'
import Dropdown from '../components/Dropdown'
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
import 'prismjs/themes/prism.css';
import { marked } from 'marked';
import Tooltip from '../components/Tooltip'

type Props = {}
const apiURl = process.env.REACT_APP_SERVER_URL

export default function Admin({ }: Props) {
    const [userFeedback, setUserFeedback] = useState<dataObj[]>([])
    const [data, setData] = useState<dataObj | null>(null)
    const [selectedFeedback, setSelectedFeedback] = useState(-1)
    const [deleteFeedback, setDeleteFeedback] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState<dataObj>({})
    const { isLoggedIn, theme, setTheme } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn === false) navigate('/')
        else getFeedback()
        setTheme('')
        Prism.highlightAll()
    }, [])

    useEffect(() => {
        if (isLoggedIn === false) navigate('/')
    }, [isLoggedIn])

    useEffect(() => {
        setData({
            notes: userFeedback[selectedFeedback]?.notes || '',
            status: userFeedback[selectedFeedback]?.status || '',
        })
        setDeleteFeedback(false)
        Prism.highlightAll()
        renderCodeBlockHeaders()
    }, [selectedFeedback])

    const updateData = (key: string, e: any) => {
        const value = e.target.value
        setData({ ...data, [key]: value })
    }

    const getFeedback = async () => {
        try {
            const response = await fetch(`${apiURl}/api/get_feedback`, {
                method: 'GET',
                headers: { "Authorization": process.env.REACT_APP_API_TOKEN || '' }
            })

            const feedback = await response.json()
            if (feedback && Array.isArray(feedback)) setUserFeedback(sortArray(sortArray(feedback, 'session_id', true), 'createdAt', true))

        } catch (error) {
            console.error(error)
        }
    }

    const discardChanges = () => {
        setSelectedFeedback(-1)
        setDeleteFeedback(false)
    }

    const saveReview = async () => {
        try {
            const reviewDta: dataObj = {
                ...data,
                id: userFeedback[selectedFeedback].id,
            }

            const response = await fetch(`${apiURl}/api/update_feedback`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewDta)
            })
            if (response && response.ok) {
                toast.success('Review saved!')
                discardChanges()
                await getFeedback()
            }
            else toast.error('Error saving review. Please try again')
        } catch (error) {
            toast.error('Error saving review. Please try again')
            console.error(error)
        }
    }

    const deleteReview = async () => {
        try {
            const response = await fetch(`${apiURl}/api/delete_feedback`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFeedback[selectedFeedback])
            })
            if (response && response.ok) {
                toast.success('Review deleted!')
                discardChanges()
                await getFeedback()
            }
            else toast.error('Error deleting review. Please try again')
        } catch (error) {
            toast.error('Error deleting review. Please try again')
            console.error(error)
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

    const renderCodeBlockHeaders = () => {
        const codeBlocks = Array.from(document.querySelectorAll('pre[class*="language-"]'))
        codeBlocks.forEach((codeBlock, index) => {
            if (!codeBlock.innerHTML.includes('chat__code-header') || !codeBlock.outerHTML.includes('chat__code-header')) {
                const language = codeBlock.className.replace('language-', '')

                const header = document.createElement('div')
                header.className = 'chat__code-header'
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
        Array.from(document.querySelectorAll('.chat__message-content-assistant')).forEach(message => {
            Array.from(message.querySelectorAll('a')).forEach(anchor => {
                anchor.target = '_blank'
            })
        })
    }


    const handleSubmit = async (event: any) => {
        try {
            setIsLoading(true)
            event.preventDefault()
            const content = searchQuery.trim()
            if (!content || isLoading) return
            setSearchQuery('');

            const response = await fetch(`${apiURl}/api/vectorstore_search?query=${encodeURIComponent(content)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response && response.ok) {
                const data = await response.json()
                setSearchResults(data)
            }
            setIsLoading(false)
        } catch (error) {
            console.error(error)
        }
    }


    return !isLoggedIn ? null :
        <div>
            <ToastContainer position="top-center" style={{ transform: 'none' }} theme={theme ? 'dark' : 'light'} autoClose={1500} />
            <div className="chat__admin">
                <h1>Admin panel</h1>
                <div className="chat__admin-row">
                    <div 
                    className={`chat__form-container${theme}`} 
                    style={{ 
                        position: 'relative', 
                        border: searchResults.query ? '1px solid lightgray' : '', 
                        borderRadius: '1rem',
                        margin: searchResults.query ? '2rem 0' : '2rem 0 0 0'
                        }}>
                        <div className="chat__admin-search">
                            {isLoading ? <p style={{ margin: '1rem 2rem' }}>Embedding query and searching in vector store...</p>
                                : searchResults.query ?
                                    <div style={{ margin: '1rem 2rem' }}>
                                        <Button
                                            label='Clear result'
                                            className={`button__delete${theme}`}
                                            onClick={() => setSearchResults({})}
                                        />
                                        <p><strong>Exact match:</strong><br /> {searchResults.exact || 'No exact match'}</p>
                                        <p><strong>Matches:</strong><br /> {searchResults.matches ? searchResults.matches.map((m: string) => <><span>{m}</span><br /><br /></>) : 'No matching docs'}</p>
                                    </div>
                                    : ''}
                            <div
                                className={`chat__form-container${theme}`}
                                style={{
                                    position: 'relative',
                                    background: theme ? '#14181E' : ''
                                }}>
                                <form className={`chat__form${theme}`} x-chunk="dashboard-03-chunk-1" onSubmit={handleSubmit}>
                                    <textarea
                                        id="message"
                                        placeholder="Search a word or phrase in the vector store"
                                        className={`chat__form-input${theme}`}
                                        value={searchQuery}
                                        name="content"
                                        rows={1}
                                        onKeyDown={(event) => {
                                            if (!isLoading && event.key === 'Enter' && !event.shiftKey) {
                                                handleSubmit(event)
                                            }
                                        }}
                                        autoFocus
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        style={{ marginLeft: '1.5rem' }}
                                    />
                                    <Tooltip tooltip={searchQuery ? 'Send message' : 'Write a message to send'} position='up' show={Boolean(searchQuery)}>
                                        <div
                                            className='chat__form-send'
                                            style={{
                                                background: searchQuery ? theme ? 'lightgray' : 'black' : theme ? 'gray' : '#d2d2d2',
                                                cursor: isLoading || !searchQuery ? 'not-allowed' : ''
                                            }}
                                            onClick={handleSubmit} >
                                            <svg className='chat__form-send-svg' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill={theme ? '#2F2F2F' : '#fff'} fillRule="evenodd" clipRule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"></path>
                                            </svg>
                                        </div>
                                    </Tooltip>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="chat__admin-row">
                    <DataTable
                        title='Feedback'
                        tableHeaders={feedbackHeaders}
                        tableData={userFeedback}
                        setTableData={setUserFeedback}
                        selected={selectedFeedback}
                        setSelected={setSelectedFeedback}
                        style={{ width: '50%' }}
                        highlight='notes'
                        max={20}
                    />
                    {deleteFeedback ?
                        <div className='chat__admin-delete'>
                            <p>Are you sure you want to permanently delete {userFeedback[selectedFeedback].username || 'user'}'s feedback?</p>
                            <div className="chat__admin-delete-buttons">
                                <Button
                                    label='Maybe not'
                                    className={`button__outline${theme}`}
                                    onClick={() => setDeleteFeedback(false)}
                                />
                                <Button
                                    label='Confirm deletion'
                                    className={`button__delete${theme}`}
                                    onClick={deleteReview}
                                />
                            </div>
                        </div>
                        : selectedFeedback !== -1 ?
                            <div className={`chat__admin-session${theme}`}>
                                <div className="chat__feedback-content" style={{ border: '1px solid lightgray', padding: '.5rem', borderRadius: '.5rem' }}>
                                    {userFeedback[selectedFeedback].messages.map((feedback: sessionType) => (
                                        <div
                                            key={feedback.id}
                                            className={`chat__feedback-content-${feedback.role}${theme}`}
                                            dangerouslySetInnerHTML={{
                                                __html: marked.parse(feedback.content || '') as string,
                                            }} />))}
                                </div>
                                <span>Comment from {userFeedback[selectedFeedback].username || 'user'}: <p className='chat__admin-comment'>{userFeedback[selectedFeedback].comments || 'Not registered.'}</p></span>
                                <InputField
                                    label='Review notes'
                                    name='notes'
                                    type='textarea'
                                    updateData={updateData}
                                    value={data?.notes || ''}
                                    style={{ marginTop: '1rem' }}
                                />
                                <div className="chat__admin-review-buttons">
                                    <Dropdown
                                        label='Status'
                                        options={['Disregardable', 'Corrected', 'On hold']}
                                        selected={data?.status}
                                        value={data?.status}
                                        setSelected={value => setData(prev => ({ ...prev, status: value }))}
                                        style={{ width: '10rem', marginTop: '.5rem' }}
                                    />
                                    <div className="chat__admin-review-buttons">
                                        <Button
                                            label='Discard review'
                                            onClick={discardChanges}
                                        />
                                        <Button
                                            label='Save review'
                                            className={`button__outline${theme}`}
                                            onClick={saveReview}
                                        />
                                        <Button
                                            label='Delete feedback'
                                            className={`button__delete${theme}`}
                                            onClick={() => setDeleteFeedback(true)}
                                            style={{ justifySelf: 'flex-end' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            : ''}
                </div>
            </div>
        </div >
}