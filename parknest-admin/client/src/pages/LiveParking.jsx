import React, { useState, useEffect, useCallback } from 'react';
import { parkingService } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  Clock,
  Map
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    OCCUPIED: 'bg-red-100 text-red-800 border-red-300 font-bold',
    RESERVED: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    OFFLINE: 'bg-gray-200 text-gray-700 border-gray-300 font-bold',
    MAINTENANCE: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs border shadow-xs ${styles[status] || styles.OFFLINE}`}>
      {status}
    </span>
  );
};

const SlotCard = ({ slot, onClick }) => {
  const isAvailable = slot.status === 'AVAILABLE';
  const isOccupied = slot.status === 'OCCUPIED';
  const isOffline = slot.status === 'OFFLINE';
  const isReserved = slot.status === 'RESERVED';
  const isMaintenance = slot.status === 'MAINTENANCE';

  let cardBg = 'bg-white border-gray-200';
  let indicatorColor = 'bg-gray-400';

  if (isAvailable) {
    cardBg = 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 shadow-emerald-50/50';
    indicatorColor = 'bg-emerald-500';
  } else if (isOccupied) {
    cardBg = 'bg-red-50/70 border-red-300 hover:border-red-500 shadow-red-50/50';
    indicatorColor = 'bg-red-500';
  } else if (isReserved) {
    cardBg = 'bg-amber-50/70 border-amber-300 hover:border-amber-500';
    indicatorColor = 'bg-amber-500';
  } else if (isMaintenance) {
    cardBg = 'bg-purple-50/70 border-purple-300 hover:border-purple-500';
    indicatorColor = 'bg-purple-500';
  } else if (isOffline) {
    cardBg = 'bg-gray-100/80 border-gray-300 opacity-80';
    indicatorColor = 'bg-gray-400';
  }

  const lastUpdatedText = slot.lastUpdated
    ? formatDistanceToNow(new Date(slot.lastUpdated), { addSuffix: true })
    : 'Recently';

  return (
    <div
      onClick={() => onClick(slot)}
      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${cardBg}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${indicatorColor} ${isOffline ? '' : 'animate-pulse'}`} />
          <div>
            <h4 className="text-lg font-bold text-gray-900">{slot.slotId}</h4>
            <p className="text-xs text-gray-500">{slot.areaId?.name || 'Main Area'}</p>
          </div>
        </div>
        <StatusBadge status={slot.status} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {isOffline ? (
            <WifiOff size={15} className="text-gray-400" />
          ) : (
            <Wifi size={15} className="text-emerald-600" />
          )}
          <span className="text-gray-600 text-xs font-medium">
            Sensor: <strong className="text-gray-800">{slot.sensorId || 'N/A'}</strong>
          </span>
        </div>

        {slot.distance !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle size={14} className="text-gray-400" />
            <span className="text-gray-600">Reading: <strong className="text-gray-800">{slot.distance} cm</strong></span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-[10px] text-gray-500">
          <span>Updated {lastUpdatedText}</span>
        </div>
      </div>
    </div>
  );
};

const SlotDetailModal = ({ slot, onClose }) => {
  if (!slot) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Slot Details: {slot.slotId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer">✕</button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={slot.status} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sensor ID</p>
              <p className="font-bold font-mono text-gray-900">{slot.sensorId || 'Not Assigned'}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2"><Map size={16} /> Area</span>
              <span className="font-medium text-gray-900">{slot.areaId?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2"><AlertTriangle size={16} /> Reading</span>
              <span className="font-medium font-mono text-gray-900">{slot.distance !== undefined ? `${slot.distance} cm` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2"><Info size={16} /> Threshold</span>
              <span className="font-medium text-gray-900">{slot.threshold || 10} cm</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2"><Clock size={16} /> Last Update</span>
              <span className="font-medium text-xs text-gray-700">
                {slot.lastUpdated ? new Date(slot.lastUpdated).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <button
            className="w-full bg-parknest-blue text-white py-3.5 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 cursor-pointer"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveParking = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(() => Boolean(socket?.connected));

  const fetchSlots = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await parkingService.getSlots();
      setSlots(response.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(true);
  }, [fetchSlots]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleSlotUpdate = (updatedSlot) => {
      setSlots(prevSlots => prevSlots.map(s =>
        s.slotId === updatedSlot.slotId ? { ...s, ...updatedSlot } : s
      ));

      if (selectedSlot?.slotId === updatedSlot.slotId) {
        setSelectedSlot(prev => prev ? ({ ...prev, ...updatedSlot }) : null);
      }
    };

    const handleParkingUpdate = ({ slot }) => {
      if (slot) handleSlotUpdate(slot);
      else fetchSlots(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('slotUpdated', handleSlotUpdate);
    socket.on('parkingUpdated', handleParkingUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('slotUpdated', handleSlotUpdate);
      socket.off('parkingUpdated', handleParkingUpdate);
    };
  }, [socket, selectedSlot, fetchSlots]);

  if (loading) return <div className="p-10 text-center font-medium text-gray-500">Loading live parking grid...</div>;

  const groupedSlots = slots.reduce((acc, slot) => {
    const areaName = slot.areaId?.name || 'General Area';
    if (!acc[areaName]) acc[areaName] = [];
    acc[areaName].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Parking Grid</h1>
          <p className="text-gray-500 mt-2">Real-time IoT slot occupancy visualization</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-semibold text-gray-700">AVAILABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs font-semibold text-gray-700">OCCUPIED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs font-semibold text-gray-700">RESERVED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs font-semibold text-gray-700">OFFLINE</span>
          </div>
          <div className="border-l pl-3 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-500">{isConnected ? 'LIVE' : 'SYNCING'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedSlots).map(([areaName, areaSlots]) => (
          <div key={areaName} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">{areaName}</h2>
              <div className="h-[1px] flex-grow bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {areaSlots.map((slot) => (
                <SlotCard
                  key={slot._id || slot.slotId}
                  slot={slot}
                  onClick={setSelectedSlot}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
};

export default LiveParking;
