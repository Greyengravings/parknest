import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load saved user state from localStorage or use defaults
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('parknest_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : []
        };
      } catch {
        return {
          isLoggedIn: true,
          phone: '+91 98765 43210',
          name: 'ParkNest Driver',
          email: '',
          vehicles: []
        };
      }
    }
    return {
      isLoggedIn: true,
      phone: '+91 98765 43210',
      name: 'Hitesh Nihalani',
      email: 'hitesh@example.com',
      vehicles: [
        {
          id: 'v-1',
          plate: 'MH-02-CB-4321',
          type: 'Sedan',
          model: 'Honda City',
          color: 'Pearl White',
          isDefault: true
        },
        {
          id: 'v-2',
          plate: 'MH-04-EV-9876',
          type: 'EV',
          model: 'Tata Nexon EV',
          color: 'Teal Blue',
          isDefault: false
        }
      ]
    };
  });

  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'

  useEffect(() => {
    localStorage.setItem('parknest_user', JSON.stringify(user));
  }, [user]);

  const loginWithPhone = (phone) => {
    setUser(prev => ({
      ...prev,
      isLoggedIn: true,
      phone
    }));
  };

  const logout = () => {
    setUser(prev => ({
      ...prev,
      isLoggedIn: false
    }));
  };

  const addVehicle = (newVehicle) => {
    const plate = newVehicle.plate.toUpperCase().trim();
    if (!plate) return;
    setUser(prev => {
      if (prev.vehicles.some(vehicle => vehicle.plate === plate)) return prev;
      const vehicleObj = {
        id: 'v-' + Date.now(),
        plate,
        type: newVehicle.type || 'Sedan',
        model: newVehicle.model || 'My Car',
        color: newVehicle.color || 'White',
        isDefault: prev.vehicles.length === 0
      };
      return { ...prev, vehicles: [...prev.vehicles, vehicleObj] };
    });
  };

  const setDefaultVehicle = (id) => {
    setUser(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => ({
        ...v,
        isDefault: v.id === id
      }))
    }));
  };

  const deleteVehicle = (id) => {
    setUser(prev => {
      const vehicles = prev.vehicles.filter(v => v.id !== id);
      if (vehicles.length > 0 && !vehicles.some(v => v.isDefault)) {
        vehicles[0].isDefault = true;
      }
      return { ...prev, vehicles };
    });
  };

  const updateProfile = (profile) => {
    setUser(prev => ({ ...prev, ...profile }));
  };

  const getDefaultVehicle = () => {
    return user.vehicles.find(v => v.isDefault) || user.vehicles[0];
  };

  return (
    <UserContext.Provider value={{
      user,
      loginWithPhone,
      logout,
      addVehicle,
      setDefaultVehicle,
      deleteVehicle,
      updateProfile,
      getDefaultVehicle,
      activeTab,
      setActiveTab
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
