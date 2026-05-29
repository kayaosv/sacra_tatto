import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../lib/kayao-tokens.css';
import '../lib/lasacra-theme.css';
import '../lib/lasacra-layout.css';
import './image-slot.js';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
