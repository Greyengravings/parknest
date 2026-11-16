import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ParkingCircle,
  Map,
  CalendarCheck,
  BarChart3,
  Cpu,
  Radio,
  Users,
  Settings,
  Car
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Live Parking', icon: ParkingCircle, path: '/live-parking' },
    { name: 'Parking Areas', icon: Map, path: '/areas' },
    { name: 'Reservations', icon: CalendarCheck, path: '/reservations' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Sensors', icon: Cpu, path: '/sensors' },
    { name: 'Sensor Monitor', icon: Radio, path: '/sensor-monitor' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-parknest-dark text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="bg-parknest-blue p-2 rounded-lg">
          <Car size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">ParkNest</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 p-3 rounded-lg transition-colors
              ${isActive
                ? 'bg-parknest-blue text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-gray-500">admin@parknest.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
