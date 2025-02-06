import { AppContext } from "../AppContext"
import { useContext } from "react"

type Props = {
  label?: string
  onClick?: any
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
}

export const Button = ({ label, onClick, className, style, disabled }: Props) => {
  const { theme } = useContext(AppContext)
  return (
    <button
      onClick={onClick}
      style={{ ...style, cursor: disabled ? 'not-allowed' : '' }}
      className={`button__default${theme} ${className || ''}`}
      disabled={disabled}
    >
      {label}
    </button>
  )
}