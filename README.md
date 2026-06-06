# Gemini AI Chatbot - React Frontend

A modern React frontend for your Spring Boot + Gemini AI chatbot.

## Prerequisites
- Node.js 16+
- Spring Boot backend running on `localhost:8080`

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npm start
```
Opens at `http://localhost:3000`

> The `"proxy": "http://localhost:8080"` in `package.json` automatically forwards `/api/chat` calls to your Spring Boot backend — no CORS issues!

## Project Structure
```
src/
├── components/
│   ├── ChatWindow.js       # Main chat UI component
│   └── ChatWindow.css      # Chat styles
├── App.js                  # Root component
├── App.css                 # Layout & background
├── index.js                # Entry point
└── index.css               # Global styles & CSS variables
```

## Features
- Dark theme with purple accent
- Markdown rendering in bot responses (bold, bullets, code blocks)
- Typing indicator animation
- Enter to send / Shift+Enter for new line
- New Chat button to reset conversation
- Fully responsive (mobile friendly)
- Error handling if backend is down

## API
Calls `POST /api/chat` with:
```json
{ "message": "Your question here" }
```
Expects:
```json
{ "message": "Bot response here" }
```
