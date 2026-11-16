import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { parkingService, reservationService } from '../../services/api';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

const BookParking = ({ slots = [], sensors = [], reservations = [] }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, getDefaultVehicle } = useUser();
  const defaultVehicle = getDefaultVehicle();

  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(searchParams.get('areaId') || '');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState(defaultVehicle?.plate || '');
  const [durationHours, setDurationHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const fetchAreas = useCallback(async () => {
    setError('');
    try {
      const res = await parkingService.getAreas();
      const areaList = res.data || [];
      setAreas(areaList);
      if (areaList.length > 0) setSelectedAreaId((current) => current || areaList[0]._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load parking areas. Please retry.');
    } finally {
      setAreasLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const areaSlots = slots.filter(s => {
    if (!selectedAreaId) return true;
    const areaIdVal = typeof s.areaId === 'object' ? s.areaId?._id : s.areaId;
    return areaIdVal === selectedAreaId;
  });

  const selectedSlotData = slots.find(s => s.slotId === selectedSlotId);
  const selectedVehicle = user.vehicles.find(vehicle => vehicle.plate === selectedVehiclePlate) || defaultVehicle;
  const activeReservations = reservations.filter((reservation) =>
    ['ACTIVE', 'PENDING'].includes(reservation.status) &&
    new Date(reservation.endTime) > new Date()
  );
  const selectedSlotSensor = sensors.find((sensor) => sensor.sensorId === selectedSlotData?.sensorId);
  const confirmedSensorState = !selectedSlotData?.sensorId || !selectedSlotSensor
    ? 'Not connected'
    : selectedSlotData.status === 'OFFLINE' || selectedSlotSensor.status === 'OFFLINE'
      ? 'Offline'
      : Number(selectedSlotData.distance) < Number(selectedSlotData.threshold || 10) ? 'Occupied' : 'Empty';

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user.vehicles.length || !selectedVehicle) {
      setError('Register or select one of your vehicles before booking.');
      return;
    }
    if (!selectedSlotId) {
      setError('Please select an available parking slot from the grid below.');
      return;
    }
    if (selectedSlotData?.status !== 'AVAILABLE') {
      setError('That slot is no longer available. Select another slot.');
      setSelectedSlotId('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await reservationService.createReservation({
        slotId: selectedSlotId,
        userId: user.phone || 'USER-' + Date.now().toString().slice(-4),
        userName: user.name,
        userPhone: user.phone,
        vehicleNumber: selectedVehicle.plate,
        vehicleType: selectedVehicle.type,
        durationHours: Number(durationHours)
      });

      setConfirmedReservation(res.data.reservation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/user')}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <Calendar className="text-blue-600" size={24} />
            Reserve a Parking Slot
          </h1>
          <p className="text-xs text-gray-500">Choose a parking area, select your slot, and confirm your booking with live IoT integration.</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
          <ShieldCheck size={16} className="text-blue-600" />
          <span>Instant Pass Generation & Sensor Sync</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Selection Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Select Parking Area */}
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              Select Parking Location
            </h3>

            {areasLoading ? <p className="py-4 text-sm text-slate-500">Loading parking areas…</p> : areas.length === 0 ? <p className="py-4 text-sm text-slate-500">No areas are available. Seed the demo data and retry.</p> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {areas.map((area) => (
                <button
                  key={area._id}
                  type="button"
                  onClick={() => {
                    setSelectedAreaId(area._id);
                    setSelectedSlotId('');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedAreaId === area._id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-bold text-gray-900 text-xs">{area.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{area.location}</div>
                  <div className="text-[10px] font-semibold text-blue-700 mt-2">
                    {area.totalSlots || 10} Total Slots
                  </div>
                </button>
              ))}
            </div>}
          </div>

          {/* Step 2: Select Slot Grid */}
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                Choose Available Parking Slot
              </h3>

              {/* Slot Status Legend */}
              <div className="flex items-center gap-3 text-[11px] text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-emerald-500"></span> Available
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-blue-500"></span> Reserved
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-red-500"></span> Occupied
                </div>
              </div>
            </div>

            {/* Grid of Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
              {areaSlots.map((slot) => {
                const isRealIoT = slot.slotId === 'PN-A-001';
                const isSelected = selectedSlotId === slot.slotId;
                const activeReservation = activeReservations.find((reservation) => reservation.slotId === slot.slotId);
                const sensor = sensors.find((record) => record.sensorId === slot.sensorId);
                const sensorState = slot.status === 'MAINTENANCE'
                  ? 'maintenance'
                  : slot.status === 'OFFLINE' || sensor?.status === 'OFFLINE'
                    ? 'offline'
                    : !slot.sensorId || !sensor
                      ? 'not connected'
                      : Number(slot.distance) < Number(slot.threshold || 10) ? 'occupied' : 'empty';
                const isAvailable = slot.status === 'AVAILABLE' && !activeReservation;

                let statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                if (slot.status === 'RESERVED') statusBg = 'bg-blue-50 border-blue-300 text-blue-800';
                if (slot.status === 'OCCUPIED') statusBg = 'bg-red-50 border-red-300 text-red-800';
                if (['OFFLINE', 'MAINTENANCE'].includes(slot.status)) statusBg = 'bg-slate-100 border-slate-300 text-slate-700';

                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'z-10 scale-[1.02] border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-100'
                        : isAvailable
                        ? 'hover:border-blue-500 hover:shadow-md cursor-pointer bg-white border-gray-200'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-70'
                    }`}
                  >
                    {/* IoT Real Tag */}
                    {isRealIoT && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mb-1 flex items-center gap-1 ${
                        isSelected ? 'bg-white text-blue-900' : 'bg-indigo-600 text-white'
                      }`}>
                        <Cpu size={10} /> REAL IOT
                      </span>
                    )}

                    <div className="font-mono font-extrabold text-sm">{slot.slotId}</div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        isSelected ? 'bg-white/20 text-white' : statusBg
                      }`}>
                        Slot: {slot.status}
                      </span>
                    </div>
                    <span className={`mt-1 text-[10px] font-semibold ${isSelected ? 'text-blue-100' : sensorState === 'occupied' ? 'text-red-700' : 'text-slate-500'}`}>
                      Sensor: {sensorState}
                      {slot.distance !== undefined && sensorState !== 'not connected' ? ` · last ${slot.distance} cm` : ''}
                    </span>
                    <span className="mt-1 break-all text-[10px] text-slate-500">
                      Reservation: {activeReservation ? `${activeReservation.status} · ${activeReservation.vehicleNumber}` : 'none'}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSlotData && (
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <div>
                  Selected Slot: <strong className="font-mono text-sm">{selectedSlotData.slotId}</strong> • Sensor Threshold: <strong>{selectedSlotData.threshold}cm</strong>
                </div>
                {selectedSlotData.slotId === 'PN-A-001' && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Designated sensor slot
                  </span>
                )}
              </div>
            )}
            {areaSlots.length === 0 && !areasLoading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No slots were returned for this area.</p>}
          </div>

        </div>

        {/* Right Column: Vehicle & Booking Confirmation */}
        <div className="space-y-6">
          <form onSubmit={handleBook} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              Vehicle & Time Window
            </h3>

            {/* Registered vehicle selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Registered vehicle</label>
              {user.vehicles.length ? (
                <select required value={selectedVehicle?.plate || ''} onChange={(event) => setSelectedVehiclePlate(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-900">
                  {user.vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.plate}>{vehicle.plate} · {vehicle.type}</option>)}
                </select>
              ) : (
                <button type="button" onClick={() => navigate('/user/profile')} className="w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-left text-xs font-semibold text-amber-900">No registered vehicle. Add one in your profile →</button>
              )}
            </div>

            {/* Booking Duration */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Booking Duration</label>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 4, 8].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      durationHours === h
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {h} {h === 1 ? 'Hour' : 'Hours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Summary */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Rate per hour</span>
                <span className="font-semibold text-gray-900">₹40.00 / hr</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-semibold text-gray-900">{durationHours} Hours</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold text-gray-900 text-sm">
                <span>Total Payable</span>
                <span className="text-blue-600">₹{durationHours * 40}.00</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlotId || selectedSlotData?.status !== 'AVAILABLE' || !user.vehicles.length}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Confirming Reservation...' : 'Confirm Parking Booking'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmedReservation && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Reservation Confirmed!</h2>
              <p className="text-xs text-gray-500 mt-1">Your parking pass has been generated and updated on the Admin Panel.</p>
            </div>

            {/* Parking Pass Card */}
            <div className="relative space-y-3 overflow-hidden rounded-xl bg-slate-900 p-5 text-left font-mono text-white">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400">PASS ID</span>
                  <div className="text-xs font-bold text-amber-400">{confirmedReservation.reservationId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">SLOT</span>
                  <div className="text-base font-extrabold text-emerald-400">{confirmedReservation.slotId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">VEHICLE PLATE</span>
                  <span className="font-bold">{confirmedReservation.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">TYPE</span>
                  <span className="font-bold">{confirmedReservation.vehicleType}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-2 text-[11px] text-slate-300">
                Booking window: <strong className="text-white">{new Date(confirmedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(confirmedReservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                <div className="mt-1">Reservation: <strong className="text-blue-300">{confirmedReservation.status}</strong> · Sensor: <strong className="text-emerald-300">{confirmedSensorState}</strong></div>
              </div>
            </div>

            <button
              onClick={() => navigate('/user/reservations')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
            >
              View Active Bookings Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookParking;
