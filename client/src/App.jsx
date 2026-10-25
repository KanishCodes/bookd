import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CataloguePage from './pages/CataloguePage.jsx';
import MemberDashboardPage from './pages/MemberDashboardPage.jsx';
import LibrarianDeskPage from './pages/LibrarianDeskPage.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import ReservationsPage from './pages/ReservationsPage.jsx';
import FinePaymentPage from './pages/FinePaymentPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-merino flex flex-col font-sans text-ink">
      {!isLoginPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public / Member accessible catalogue */}
          <Route
            path="/catalogue"
            element={
              <ProtectedRoute>
                <CataloguePage />
              </ProtectedRoute>
            }
          />

          {/* Member Personal Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['member', 'librarian', 'admin']}>
                <MemberDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Librarian Circulation Desk */}
          <Route
            path="/librarian"
            element={
              <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                <LibrarianDeskPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Analytics & Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Reservations (Mock-data page) */}
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={['member', 'librarian', 'admin']}>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fines and Settlements (Mock-data page) */}
          <Route
            path="/fines"
            element={
              <ProtectedRoute allowedRoles={['member', 'librarian', 'admin']}>
                <FinePaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Access Control & 404 */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isLoginPage && (
        <footer className="border-t border-sand bg-merino py-6 mt-12 text-center text-xs text-ink-muted">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="font-bold text-ink tracking-tight">
              Book’d — Library & Archival Management System
            </div>
            <div className="font-mono text-[11px] text-ink-muted/80 font-medium">
              Evaluation Build • Live Catalogue & Circulation Desk • Mock Mode Active
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
