import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx: Starting application...');
console.log('main.tsx: window.electron available?', typeof window !== 'undefined' && !!window.electron);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Root element found, rendering App...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('main.tsx: App rendered successfully');
}
