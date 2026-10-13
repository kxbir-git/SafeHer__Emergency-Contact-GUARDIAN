import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocket } from './hooks/useSocket';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { FakeCallModal } from './components/FakeCallModal';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { LiveMap } from './pages/LiveMap';
import { Contacts } from './pages/Contacts';
import { Reports } from './pages/Reports';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { LiveTrackPage } from './pages/LiveTrackPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  const { isAuthenticated, fetchUser } = useAuthStore();
  const { connected } = useSocket();
  const [fakeCallOpen, setFakeCallOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <>
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* Public Live Tracking Page (no login required for guardians) */}
        <Route path="/track" element={<LiveTrackPage />} />

        {/* Protected Dashboard & App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#FFFFFF] text-[#111827]">
                {/* Fixed Clean Sidebar */}
                <Sidebar onOpenFakeCall={() => setFakeCallOpen(true)} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  <Topbar
                    onOpenFakeCall={() => setFakeCallOpen(true)}
                    socketConnected={connected}
                  />
                  <main className="flex-1 overflow-y-auto pb-12">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/map" element={<LiveMap />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>

              {/* Global Escape Fake Call Modal */}
              <FakeCallModal
                isOpen={fakeCallOpen}
                onClose={() => setFakeCallOpen(false)}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
