import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './app/AppShell'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import TemplatesPage from './pages/TemplatesPage'
import ProjectsPage from './pages/ProjectsPage'
import BrandKitPage from './pages/BrandKitPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="editor/new" element={<EditorPage />} />
        <Route path="editor/:id" element={<EditorPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="brand-kit" element={<BrandKitPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
