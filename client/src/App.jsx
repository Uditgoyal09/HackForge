import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound404 from './components/common/NotFound404';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ExploreHackathons from './pages/public/ExploreHackathons';
import HackathonDetails from './pages/public/HackathonDetails';
import PublicProjects from './pages/public/PublicProjects';
import LeaderboardView from './components/leaderboard/LeaderboardView';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UserProfilePage from './pages/public/UserProfilePage';
import NotificationsPage from './pages/public/NotificationsPage';

// Participant Pages
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import ParticipantRegistrations from './pages/participant/ParticipantRegistrations';
import TeamManagement from './pages/participant/TeamManagement';
import ProjectSubmission from './pages/participant/ProjectSubmission';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateHackathon from './pages/organizer/CreateHackathon';
import OrganizerRegistrations from './pages/organizer/OrganizerRegistrations';
import OrganizerTeams from './pages/organizer/OrganizerTeams';
import OrganizerSubmissions from './pages/organizer/OrganizerSubmissions';

// Judge Pages
import JudgeDashboard from './pages/judge/JudgeDashboard';
import EvaluationInterface from './pages/judge/EvaluationInterface';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import ActivityLogViewer from './pages/admin/ActivityLogViewer';
import AdminAccessCodes from './pages/admin/AdminAccessCodes';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/hackathons" element={<ExploreHackathons />} />
              <Route path="/hackathons/:id" element={<HackathonDetails />} />
              <Route path="/hackathons/:id/leaderboard" element={<LeaderboardView />} />
              <Route path="/projects" element={<PublicProjects />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Authenticated Shared Routes */}
              <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>}/>
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}/>

              {/* Participant Routes */}
              <Route path="/participant" element={<Navigate to="/participant/dashboard" replace />} />
              <Route path="/participant/dashboard" element={<ProtectedRoute allowedRoles={['participant']}><ParticipantDashboard /></ProtectedRoute>}/>
              <Route path="/participant/registrations" element={<ProtectedRoute allowedRoles={['participant']}><ParticipantRegistrations /></ProtectedRoute>}/>
              <Route path="/participant/teams" element={<ProtectedRoute allowedRoles={['participant']}><TeamManagement /></ProtectedRoute>}/>
              <Route path="/participant/submissions" element={<ProtectedRoute allowedRoles={['participant']}><ProjectSubmission /></ProtectedRoute>}/>

              {/* Organizer Routes */}
              <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
              <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>}/>
              <Route path="/organizer/hackathons/create" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateHackathon /></ProtectedRoute>}/>
              <Route path="/organizer/hackathons/:id/edit" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateHackathon /></ProtectedRoute>}/>
              <Route path="/organizer/hackathons/:id/registrations" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerRegistrations /></ProtectedRoute>}/>
              <Route path="/organizer/hackathons/:id/teams" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerTeams /></ProtectedRoute>}/>
              <Route path="/organizer/hackathons/:id/submissions" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerSubmissions /></ProtectedRoute>}/>

              {/* Judge Routes */}
              <Route path="/judge" element={<Navigate to="/judge/dashboard" replace />} />
              <Route path="/judge/dashboard" element={<ProtectedRoute allowedRoles={['judge', 'admin']}><JudgeDashboard /></ProtectedRoute>}/>
              <Route path="/judge/assignments" element={<ProtectedRoute allowedRoles={['judge', 'admin']}><JudgeDashboard /></ProtectedRoute>}/>
              <Route path="/judge/assignments/:id" element={<ProtectedRoute allowedRoles={['judge', 'admin']}><EvaluationInterface /></ProtectedRoute>}/>


              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="activity" element={<ActivityLogViewer />} />
                <Route path="access-codes" element={<AdminAccessCodes />} />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}
