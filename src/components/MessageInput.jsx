import { useState, useRef, useEffect } from 'react'
import './MessageInput.css'

export default function MessageInput({ onSend, isStreaming, disabled }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea as user types
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [message])

  // Re-focus input when streaming finishes
  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus()
  }, [isStreaming])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setMessage('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const canSend = message.trim().length > 0 && !isStreaming && !disabled

  return (
    <div className="input-area">
      <div className={`input-box ${isStreaming ? 'input-box--disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder={isStreaming ? 'Waiting for response...' : 'Message Gemini...'}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming || disabled}
          rows={1}
        />

        <button
          className={`input-send-btn ${canSend ? 'input-send-btn--active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          title="Send message"
        >
          {isStreaming ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          )}
        </button>
      </div>

      <p className="input-hint">
        Enter to send &nbsp;·&nbsp; Shift + Enter for new line
      </p>
    </div>
  )
}