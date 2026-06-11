import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import MessageInput from '../components/MessageInput.jsx'
import api from '../api/axiosInstance.js'
import './ChatPage.css'

export default function ChatPage() {
  const [sessions, setSessions]                 = useState([])
  const [activeSessionId, setActiveSessionId]   = useState(null)
  const [messages, setMessages]                 = useState([])
  const [isStreaming, setIsStreaming]            = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loadingSession, setLoadingSession]     = useState(false)

  useEffect(() => {
    fetchSessions()
    const lastId = localStorage.getItem('lastSessionId')
    if (lastId) loadSession(lastId)
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/chat/sessions')
      setSessions(res.data)
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }

  const loadSession = async (sessionId) => {
    setLoadingSession(true)
    try {
      const res = await api.get(`/api/chat/${sessionId}`)
      setActiveSessionId(sessionId)
      setMessages(res.data.messages || [])
      localStorage.setItem('lastSessionId', sessionId)
    } catch (err) {
      console.error('Failed to load session:', err)
      localStorage.removeItem('lastSessionId')
    } finally {
      setLoadingSession(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const res = await api.post('/api/chat/session')
      const newSession = {
        sessionId: res.data.sessionId,
        title:     res.data.title,
        updatedAt: res.data.createdAt,
      }
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(res.data.sessionId)
      setMessages([])
      localStorage.setItem('lastSessionId', res.data.sessionId)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  const handleSelectSession = (sessionId) => {
    if (sessionId === activeSessionId) return
    setStreamingContent('')
    setIsStreaming(false)
    loadSession(sessionId)
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/api/chat/${sessionId}`)
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages([])
        localStorage.removeItem('lastSessionId')
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await api.put(`/api/chat/${sessionId}/title`, { title: newTitle })
      setSessions(prev =>
        prev.map(s => s.sessionId === sessionId ? { ...s, title: newTitle } : s)
      )
    } catch (err) {
      console.error('Failed to rename session:', err)
    }
  }

  const handleSend = useCallback(async (text) => {
    let sessionId = activeSessionId
    if (!sessionId) {
      try {
        const res = await api.post('/api/chat/session')
        sessionId = res.data.sessionId
        setSessions(prev => [{ sessionId, title: res.data.title, updatedAt: res.data.createdAt }, ...prev])
        setActiveSessionId(sessionId)
        localStorage.setItem('lastSessionId', sessionId)
      } catch (err) {
        console.error('Failed to create session:', err)
        return
      }
    }

    const userMsg = { id: Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await fetch(`http://localhost:8080/api/chat/${sessionId}/stream`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept':        'text/event-stream',
        },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        if (response.status === 401) { localStorage.clear(); window.location.href = '/login'; return }
        throw new Error(`HTTP ${response.status}`)
      }

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') break
            if (data) { fullResponse += data; setStreamingContent(fullResponse) }
          }
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: fullResponse, createdAt: new Date().toISOString() }])
      await fetchSessions()

    } catch (err) {
      console.error('Streaming error:', err)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Something went wrong. Please try again.', createdAt: new Date().toISOString() }])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [activeSessionId])

  return (
    <div className="chat-page">
      <Sidebar
        sessions={sessions}
        activeSessions={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="chat-main">
        <header className="chat-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarCollapsed(prev => !prev)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="topbar-title">
            {activeSessionId ? (sessions.find(s => s.sessionId === activeSessionId)?.title || 'Chat') : 'Gemini Chat'}
          </span>
          <button className="topbar-new-btn" onClick={handleNewChat}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </header>

        {loadingSession ? (
          <div className="chat-loading"><div className="chat-loading-spinner" /></div>
        ) : (
          <ChatWindow messages={messages} isStreaming={isStreaming} streamingContent={streamingContent} />
        )}

        <MessageInput onSend={handleSend} isStreaming={isStreaming} disabled={loadingSession} />
      </div>
    </div>
  )
}