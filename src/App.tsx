import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AgentDashboard from './pages/AgentDashboard/AgentDashboard';
import FavoritesPage from './pages/FavoritesPage';
import FavoriteListsPage from './pages/FavoriteListsPage';
import ComparePage from './pages/ComparePage';

/**
 * Root component for the application.  It defines the top level layout
 * (navigation bar) and configures the React Router routes.
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/agent/*" element={<AgentDashboard />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/lists" element={<FavoriteListsPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}