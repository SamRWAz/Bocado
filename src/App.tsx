import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { IndexPage } from './pages/Index'
import { NotFoundPage } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
