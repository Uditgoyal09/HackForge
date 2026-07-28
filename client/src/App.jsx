import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Home } from './pages/public/Home';
import { NotFound } from './pages/public/NotFound';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Dashboard Routes (Placeholder for role-based routes) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="hackathons" element={<div>Hackathons Page Placeholder</div>} />
          <Route path="teams" element={<div>Teams Page Placeholder</div>} />
          <Route path="settings" element={<div>Settings Page Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
