import { useState, useEffect, useRef } from 'react'
import './Sidebar.css'

export default function Sidebar({
  sessions,
  activeSessions,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  collapsed,
  onToggle
}) {
  const [renamingId, setRenamingId]   = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId]   = useState(null)
  const renameInputRef                = useRef(null)
  const name  = localStorage.getItem('name')  || 'User'
  const email = localStorage.getItem('email') || ''

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  const startRename = (e, session) => {
    e.stopPropagation()
    setRenamingId(session.sessionId)
    setRenameValue(session.title)
  }

  const submitRename = async (sessionId) => {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    await onRenameSession(sessionId, trimmed)
    setRenamingId(null)
  }

  const handleRenameKey = (e, sessionId) => {
    if (e.key === 'Enter')  submitRename(sessionId)
    if (e.key === 'Escape') setRenamingId(null)
  }

  const handleDelete = (e, sessionId) => {
    e.stopPropagation()
    setDeletingId(sessionId)
  }

  const confirmDelete = async (e) => {
    e.stopPropagation()
    await onDeleteSession(deletingId)
    setDeletingId(null)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const groupSessions = (sessions) => {
    const now       = new Date()
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today - 86400000)
    const week      = new Date(today - 6 * 86400000)
    const groups    = { Today: [], Yesterday: [], 'Previous 7 days': [], Older: [] }

    sessions.forEach(s => {
      const d = new Date(s.updatedAt)
      if (d >= today)          groups['Today'].push(s)
      else if (d >= yesterday) groups['Yesterday'].push(s)
      else if (d >= week)      groups['Previous 7 days'].push(s)
      else                     groups['Older'].push(s)
    })
    return groups
  }

  const groups = groupSessions(sessions)

  return (
    <>
      {!collapsed && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">Gemini Chat</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={onToggle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* New Chat */}
        <div className="sidebar-new">
          <button className="new-chat-btn" onClick={onNewChat}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            New chat
          </button>
        </div>

        {/* Sessions */}
        <nav className="sidebar-sessions">
          {sessions.length === 0 && (
            <p className="sidebar-empty">No conversations yet.</p>
          )}
          {Object.entries(groups).map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label} className="session-group">
                <span className="session-group-label">{label}</span>
                {items.map(session => (
                  <div
                    key={session.sessionId}
                    className={`session-item ${activeSessions === session.sessionId ? 'session-item--active' : ''}`}
                    onClick={() => onSelectSession(session.sessionId)}
                    onDoubleClick={(e) => startRename(e, session)}
                  >
                    {renamingId === session.sessionId ? (
                      <input
                        ref={renameInputRef}
                        className="session-rename-input"
                        value={renameValue}
                        maxLength={50}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => submitRename(session.sessionId)}
                        onKeyDown={e => handleRenameKey(e, session.sessionId)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="session-title">{session.title}</span>
                        <div className="session-actions">
                          <button className="session-action-btn" onClick={e => startRename(e, session)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="session-action-btn session-action-btn--delete" onClick={e => handleDelete(e, session.sessionId)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </nav>

        {/* Delete confirm */}
        {deletingId && (
          <div className="delete-confirm">
            <p>Delete this chat?</p>
            <div className="delete-confirm-actions">
              <button className="delete-confirm-cancel" onClick={() => setDeletingId(null)}>Cancel</button>
              <button className="delete-confirm-ok" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{name.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{name}</span>
              <span className="sidebar-user-email">{email}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

      </aside>
    </>
  )
}