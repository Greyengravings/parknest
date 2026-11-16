import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { User, MapPin, MoreHorizontal, Filter } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await reservationService.getReservations();
        setReservations(response.data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  if (loading) return <div>Loading reservations...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500 mt-2">Manage user bookings and parking schedules</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
             <Filter size={18} />
             <span className="font-medium text-gray-600">Filter</span>
           </button>
           <button className="bg-parknest-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors">
             Export Data
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reservation ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Slot</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Start Time</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">End Time</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map((res) => (
              <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{res.reservationId}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={14} className="text-gray-400" />
                    {res.userId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    {res.slotId}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(res.startTime), 'MMM dd, HH:mm')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(res.endTime), 'MMM dd, HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={res.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
