import React from 'react';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="app-container">
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
