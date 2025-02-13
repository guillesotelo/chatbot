import React, { KeyboardEvent, SyntheticEvent, useContext } from 'react'
import SearchIcon from '../assets/icons/search.svg'
import { onChangeEventType } from '../types'
import { AppContext } from '../AppContext'

type Props = {
    handleChange: (value: onChangeEventType) => void,
    triggerSearch: () => void,
    placeholder?: string,
    value?: string,
    style?: React.CSSProperties
}

export default function SearchBar(props: Props) {
    const { theme } = useContext(AppContext)

    const {
        handleChange,
        triggerSearch,
        placeholder,
        value,
        style
    } = props

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement> ) => {
        if(e.key === 'Enter') triggerSearch()
    }
    
    return (
        <div className={`searchbar__container${theme}`} style={style}>
            <img src={SearchIcon} className={`searchbar__icon${theme}`} onClick={triggerSearch} draggable={false}/>
            <input
                className={`searchbar__input${theme}`}
                onChange={handleChange}
                placeholder={placeholder}
                type='text'
                value={value}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}