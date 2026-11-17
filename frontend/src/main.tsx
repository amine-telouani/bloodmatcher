import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import '@fontsource/caveat/500.css'
import '@fontsource/plus-jakarta-sans/800.css'
import Prototype from './kdrUWouMc5o6WVyFJKJogK.prototype/index'

const frameByPath: Record<string, string> = {
  '/login': 'fWqrFXdXhgXU62nhxVEeFz',
  '/sign-in': 'fWqrFXdXhgXU62nhxVEeFz',
  '/forgot-password': 'rmMt7gR2ir9N8rHdLmvfjk',
  '/reset-password': 'wJEeDbJbLqqL3xAkSgugW1',
  '/register': 'dnT3dvocV7JJeQaerEARcZ',
  '/hospital': 'k7ziBCETCe1X8Fo2bgWvQh',
  '/donor': 'eQPYmRnssH74CaTgSv9se7',
}

const start = frameByPath[window.location.pathname] ?? 'fWqrFXdXhgXU62nhxVEeFz'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Prototype start={start} mockApi={true} />
  </React.StrictMode>,
)
