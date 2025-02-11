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

type Props = {}
const apiURl = process.env.REACT_APP_SERVER_URL

export default function Admin({ }: Props) {
    const [userFeedback, setUserFeedback] = useState<dataObj[]>([])
    const [data, setData] = useState<dataObj | null>(null)
    const [selectedFeedback, setSelectedFeedback] = useState(-1)
    const [deleteFeedback, setDeleteFeedback] = useState(false)
    const { isLoggedIn, theme, setTheme } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn === false) navigate('/')
        else getFeedback()
        setTheme('')
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
            console.log('feedback', feedback)

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


    return !isLoggedIn ? null :
        <div>
            <ToastContainer position="top-center" style={{ transform: 'none' }} theme={theme ? 'dark' : 'light'} autoClose={1500} />
            <div className="chat__admin">
                <h1>Admin panel</h1>
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
                            <div className="chat__admin-session">
                                <div className="chat__feedback-content" style={{ border: '1px solid lightgray', padding: '.5rem', borderRadius: '.5rem' }}>
                                    {userFeedback[selectedFeedback].messages.map((feedback: sessionType) => (
                                        <p key={feedback.id} className={`chat__feedback-content-${feedback.role}${theme}`}>{feedback.content}</p>
                                    ))}
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
        </div>
}