import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { HomeListStateProvider } from './context/HomeListStateContext'
import DetailsPage from './pages/DetailsPage'
import DisclaimerPage from './pages/DisclaimerPage'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <BrowserRouter>
      <HomeListStateProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="water/:id" element={<DetailsPage />} />
            <Route path="disclaimer" element={<DisclaimerPage />} />
          </Route>
        </Routes>
      </HomeListStateProvider>
    </BrowserRouter>
  )
}
