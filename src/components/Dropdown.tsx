import React, { useContext, useEffect, useRef, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { AppContext } from '../AppContext'
import { dataObj } from '../types'
import Chevron from '../assets/icons/chevron-down.svg'

type Props = {
    label: string
    options: string[] | number[] | dataObj[]
    value?: string | number | dataObj
    objKey?: string | number
    selected: any
    setSelected: (value: any) => void
    isTime?: boolean
    isDate?: boolean
    locale?: string
    maxHeight?: string
    style?: React.CSSProperties
    multiselect?: boolean
    loading?: boolean
    bgColor?: string
    color?: string
}

export default function Dropdown(props: Props) {
    const [openDrop, setOpenDrop] = useState(false)
    const { theme, isMobile } = useContext(AppContext)
    const dropRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLDivElement>(null)

    const {
        label,
        selected,
        setSelected,
        options,
        value,
        objKey,
        isTime,
        isDate,
        locale,
        maxHeight,
        style,
        multiselect,
        loading,
        bgColor,
        color
    } = props

    useEffect(() => {
        const dropdownListener = () => window.addEventListener('mouseup', (e: MouseEvent) => {
            try {
                const className = (e.target as HTMLElement).className || ''
                if (!className || typeof className !== 'string') return
                if (className.includes('section') && [dropRef.current, selectRef.current].includes(e.target as HTMLDivElement)) return
                if (!className.includes('dropdown')) setOpenDrop(false)
                if (className.includes('dropdown')
                    && !className.includes('option')
                    && e.target !== dropRef.current) setOpenDrop(false)
            } catch (err) {
                console.error(err)
            }
        })
        dropdownListener()

        return window.removeEventListener('mouseup', dropdownListener)
    }, [])

    useEffect(() => {
        if (dropRef.current && optionsRef.current) {
            const bounding = dropRef.current.getBoundingClientRect()
            if (bounding) {
                optionsRef.current.style.marginTop = (bounding.height - 2).toFixed(0) + 'px'
                optionsRef.current.style.width = (bounding.width - 2).toFixed(0) + 'px'
            }
        }
    }, [openDrop])

    const getSelectValues = () => {
        if (value && Array.isArray(value) && value.length) {
            return value.map((val: dataObj | string | number) =>
                !val ? '' : typeof val === 'string' || typeof val === 'number' ? val :
                    objKey && val[objKey] ? val[objKey] : '')
        }
        return []
    }

    const getSelectValue = () => {
        if (value && typeof value === 'string' || typeof value === 'number') {
            if (isDate) return value ? new Date(value).toLocaleDateString(locale || 'sv-SE') : 'Select'
            if (isTime) return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            else return value
        }
        return objKey && selected && selected[objKey] ? selected[objKey] : 'Select'
    }

    const renderSelectedItem = () => {
        return <div
            className={`dropdown__select${theme}`}
            style={{
                border: color ? `1px solid ${color}` : openDrop ? '1px solid #7089AC' : '',
                borderBottomRightRadius: openDrop ? 0 : '',
                borderBottomLeftRadius: openDrop ? 0 : '',
                filter: openDrop ? theme ? 'brightness(120%)' : 'brightness(95%)' : '',
                backgroundColor: bgColor || '',
                color: color || ''
            }}
            ref={selectRef}
            onClick={() => setOpenDrop(!openDrop)}>
            <p className={`dropdown__selected${theme}`} style={{ color: color || '', backgroundColor: bgColor || '' }}>
                {getSelectValue()}
            </p>
            <img src={Chevron} alt='Chevron' draggable={false} style={{ transform: openDrop ? 'rotate(180deg)' : '' }} className={`dropdown__chevron${theme}`} />
        </div>
    }

    const removeItem = (index: number) => {
        const newSelection = [...selected]
        newSelection.splice(index, 1)
        setSelected(newSelection)
    }

    const renderSelectedItems = () => {
        return <div
            className={`dropdown__select${theme}`}
            style={{
                border: color ? `1px solid ${color}` : openDrop ? '1px solid #7089AC' : '',
                borderBottomRightRadius: openDrop ? 0 : '',
                borderBottomLeftRadius: openDrop ? 0 : '',
                filter: openDrop ? theme ? 'brightness(120%)' : 'brightness(95%)' : ''
            }}
            ref={selectRef}
            onClick={() => setOpenDrop(!openDrop)}>
            <p
                className={`dropdown__selected${theme}`}
                style={{
                    height: multiselect ? 'fit-content' : '',
                    flexWrap: multiselect ? 'wrap' : 'unset',
                }}>
                {getSelectValues()?.length ? getSelectValues()?.map((val, i) =>
                    <span key={i} className={`dropdown__selected-multi-item${theme}`}>
                        <p className='dropdown__selected-multi-label'>{val}</p>
                        <p className='dropdown__selected-multi-remove' onClick={() => removeItem(i)}>X</p>
                    </span>
                ) : <p style={{ padding: 0 }} className={`dropdown__selected${theme}`}>Select</p>}
            </p>
            <img src={Chevron} alt='Chevron' draggable={false} style={{ transform: openDrop ? 'rotate(180deg)' : '' }} className={`dropdown__chevron${theme}`} />
        </div>
    }

    const renderDropDownOptions = () => {
        return <div
            className={`dropdown__options${theme}`}
            style={{ borderTop: 'none', maxHeight: maxHeight || '' }}
            ref={optionsRef}>
            {options?.length ?
                options.map((option: any, i: number) =>
                    <div
                        key={i}
                        className={`dropdown__option${theme}`}
                        onClick={() => {
                            if (multiselect) {
                                if (objKey && selected.filter((el: dataObj) => el[objKey] && el[objKey] === option[objKey])?.length) return setOpenDrop(false)
                                if (selected.filter((el: any) => el === option)?.length) return setOpenDrop(false)
                                const newSelection = [...selected]
                                setSelected(newSelection.concat(option))
                            }
                            else setSelected(option)
                            setOpenDrop(false)
                        }}>
                        <p className={`dropdown__option-text`}>
                            {isDate ? new Date(option).toLocaleDateString(locale || 'sv-SE') :
                                isTime ? new Date(option).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                    objKey ? option[objKey] : option}
                        </p>
                    </div>)
                :
                <h4 className={`dropdown__option${theme}`} style={{ borderTop: 'none' }}>Loading...</h4>
            }
        </div>
    }

    const renderLoading = () => {
        return (
            <div className={`dropdown__select${theme}`}>
                <p
                    className={`dropdown__selected${theme}`}
                    style={{
                        height: multiselect ? 'fit-content' : '',
                        flexWrap: multiselect ? 'wrap' : 'unset',
                    }}>
                    <BeatLoader color='lightgray' size='1rem' />
                </p>
            </div>
        )
    }

    const renderMultiSelect = () => {
        return (
            <div className={`dropdown__container${theme}`} style={{ ...style, backgroundColor: bgColor || '' }}>
                {label ? <h4 className={`dropdown__label${theme}`}>{label}</h4> : ''}
                <div ref={dropRef} className={`dropdown__select-section${theme}`}>
                    {loading ? renderLoading() : renderSelectedItems()}
                    {openDrop ? renderDropDownOptions() : ''}
                </div>
            </div>
        )
    }

    const renderSimpleSelect = () => {
        return (
            <div className={`dropdown__container${theme}`} style={{ ...style, backgroundColor: bgColor || '' }}>
                {label ? <h4 className={`dropdown__label${theme}`}>{label}</h4> : ''}
                <div ref={dropRef} className={`dropdown__select-section${theme}`}>
                    {loading ? renderLoading() : renderSelectedItem()}
                    {openDrop ? renderDropDownOptions() : ''}
                </div>
            </div>
        )
    }


    return multiselect ? renderMultiSelect() : renderSimpleSelect()
}
