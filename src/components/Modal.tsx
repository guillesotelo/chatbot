import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AppContext } from '../AppContext'

type Props = {
    children?: ReactNode
    onClose?: () => void
    title?: string | null
    subtitle?: string | null
    style?: React.CSSProperties
    logo?: string
    showLogo?: boolean
}

export default function Modal({ children, onClose, title, subtitle, style, logo, showLogo }: Props) {
    const [closeAnimation, setCloseAnimation] = useState('')
    const { theme } = useContext(AppContext)

    useEffect(() => {
        const closeOnOuterClick = (e: any) => {
            if (e.target.className === 'modal__wrapper') closeModal()
        }
        const closeOnEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal()
        }
        // document.addEventListener('click', closeOnOuterClick)
        document.addEventListener('keydown', closeOnEsc)
        return () => {
            // document.removeEventListener('click', closeOnOuterClick)
            document.removeEventListener('keydown', closeOnEsc)
        }
    }, [])

    const closeModal = () => {
        setCloseAnimation('close-animation')
        setTimeout(() => onClose ? onClose() : null, 200)
    }

    return (
        <div className="modal__wrapper">
            <div className={`modal__container${theme} ${closeAnimation}`} style={style}>
                <div className="modal__header">
                    <div className="modal__titles">
                        <h1 className="modal__title">{title}</h1>
                        <h2 className="modal__subtitle">{subtitle}</h2>
                    </div>
                    <button className={`modal__close${theme}`} onClick={closeModal}>X</button>
                </div>
                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>
    )
}