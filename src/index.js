import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import App from './app';

//router //redux store
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
