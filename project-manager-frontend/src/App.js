import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectForm from './pages/ProjectForm';
import ProjectDetail from './pages/ProjectDetail';
import ClientList from './pages/ClientList';
import ClientProjects from './pages/ClientProjects';
import ClientPortal from './pages/ClientPortal';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import ServicePackageManagement from './pages/ServicePackageManagement';
import PortfolioManagement from './pages/PortfolioManagement';
import PortfolioPublic from './pages/PortfolioPublic';

function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/demo/:clientCode" element={<ClientPortal />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/portfolio-showcase" element={<PortfolioPublic />} />

          {/* Admin routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/:id" element={<ClientProjects />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="service-packages" element={<ServicePackageManagement />} />
            <Route path="portfolio" element={<PortfolioManagement />} />
          </Route>
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
