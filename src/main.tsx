import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const GemmaPhaseOne = lazy(() => import('./labs/GemmaPhaseOne.tsx'));
const isGemmaPhaseOne = window.location.pathname === '/lab/gemma';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isGemmaPhaseOne ? (
      <Suspense fallback={<div className="min-h-screen bg-black text-white grid place-items-center font-mono">Loading Gemma lab…</div>}>
        <GemmaPhaseOne />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
