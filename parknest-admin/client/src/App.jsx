import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LiveParking from './pages/LiveParking';
import ParkingAreas from './pages/ParkingAreas';
import Reservations from './pages/Reservations';
import Analytics from './pages/Analytics';
import Sensors from './pages/Sensors';
import LiveSensorMonitor from './pages/LiveSensorMonitor';

// Placeholder pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300">
    <h2 className="text-xl font-bold text-gray-400">{title} Page Coming Soon</h2>
  </div>
);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="live-parking" element={<LiveParking />} />
          <Route path="areas" element={<ParkingAreas />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="sensors" element={<Sensors />} />
          <Route path="sensor-monitor" element={<LiveSensorMonitor />} />
          <Route path="users" element={<Placeholder title="Users" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
