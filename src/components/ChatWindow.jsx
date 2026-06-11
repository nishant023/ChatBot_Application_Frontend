import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatWindow.css'

function TypingIndicator() {
  return (
    <div className="message message--ai">
      <div className="message-avatar">AI</div>
      <div className="message-bubble message-bubble--ai typing-indicator">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : msg.time || ''

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--ai'}`}>
      {!isUser && <div className="message-avatar">AI</div>}

      <div className={`message-body ${isUser ? 'message-body--user' : 'message-body--ai'}`}>
        <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <div className="code-block">
                      {match && <div className="code-lang">{match[1]}</div>}
                      <pre><code className={className} {...props}>{children}</code></pre>
                    </div>
                  ) : (
                    <code className="code-inline" {...props}>{children}</code>
                  )
                },
                p: ({ children }) => <p>{children}</p>,
                ul: ({ children }) => <ul>{children}</ul>,
                ol: ({ children }) => <ol>{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {time && <span className="message-time">{time}</span>}
      </div>

      {isUser && <div className="message-avatar message-avatar--user">You</div>}
    </div>
  )
}

export default function ChatWindow({ messages, isStreaming, streamingContent }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div className="chat-window">
      {isEmpty ? (
        <div className="chat-empty">
          <div className="chat-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 className="chat-empty-title">How can I help you today?</h2>
          <p className="chat-empty-sub">Ask me anything — I'm powered by Gemini AI.</p>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg) => (
            <Message key={msg.id || msg._id || Math.random()} msg={msg} />
          ))}

          {/* Live streaming bubble */}
          {isStreaming && streamingContent && (
            <div className="message message--ai">
              <div className="message-avatar">AI</div>
              <div className="message-body message-body--ai">
                <div className="message-bubble message-bubble--ai message-bubble--streaming">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Typing dots — before first chunk arrives */}
          {isStreaming && !streamingContent && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}