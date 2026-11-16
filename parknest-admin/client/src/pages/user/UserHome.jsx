import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { parkingService } from '../../services/api';
import InteractiveMap from '../../components/InteractiveMap';
import LiveSensorDemoTrigger from '../../components/LiveSensorDemoTrigger';
import { distanceInKm, getCoordinates } from '../../utils/location';
import {
  ArrowUpDown, BookOpen, Calendar, Car, CheckCircle2,
  ChevronRight, Compass, MapPin, Shield, Sparkles, Wrench
} from 'lucide-react';

const DEMO_LOCATION = { latitude: 19.045, longitude: 72.889 };

const UserHome = ({
  slots = [], realSlot, realSensor, onTriggerComplete,
  location, locationStatus = 'idle', onLocateMe, socketConnected, reservations = []
}) => {
  const { user, getDefaultVehicle } = useUser();
  const navigate = useNavigate();
  const defaultVehicle = getDefaultVehicle();
  const [areas, setAreas] = useState([]);
  const [sortByProximity, setSortByProximity] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const referenceLocation = location || DEMO_LOCATION;

  const fetchHomeData = useCallback(async () => {
    setLoadError('');
    try {
      const areaResponse = await parkingService.getAreas();
      setAreas(areaResponse.data || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load nearby parking. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const enrichedAreas = areas.map((area) => {
    const areaSlots = slots.filter((slot) => {
      const slotAreaId = typeof slot.areaId === 'object' ? slot.areaId?._id : slot.areaId;
      return slotAreaId === area._id;
    });
    const areaCoordinates = getCoordinates(area) ||
      (/demo/i.test(`${area.name} ${area.location}`) ? DEMO_LOCATION : null);
    return {
      ...area,
      availableSlots: areaSlots.filter((slot) => slot.status === 'AVAILABLE').length,
      distanceKm: areaCoordinates ? distanceInKm(referenceLocation, areaCoordinates) : null
    };
  });
  const sortedAreas = [...enrichedAreas].sort((a, b) => sortByProximity
    ? (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE)
    : b.availableSlots - a.availableSlots
  );
  const phone = (user.phone || '').replace(/\D/g, '');
  const activeReservations = reservations.filter((reservation) =>
    ['ACTIVE', 'PENDING'].includes(reservation.status) &&
    reservation.userPhone?.replace(/\D/g, '') === phone &&
    new Date(reservation.endTime) > new Date()
  );
  const services = [
    { id: 'puc', title: 'PUC testing', description: 'Find nearby pollution testing centers.', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'repair', title: 'Car repairs', description: 'Search for repair shops and mechanics.', icon: Wrench, color: 'text-amber-700 bg-amber-50' },
    { id: 'rto', title: 'RTO offices', description: 'Find nearby RTO offices and services.', icon: Shield, color: 'text-violet-700 bg-violet-50' },
    { id: 'guides', title: 'Fitting guides', description: 'Quick tips for common car accessories.', icon: BookOpen, color: 'text-blue-700 bg-blue-50' }
  ];

  return (
    <div className="space-y-6 pb-10">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              <Sparkles size={13} className="text-blue-600" /> ParkNest Driver App
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome, {user.name?.split(' ')[0] || 'Driver'}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">See nearby parking, understand live sensor readings, and reserve with your registered vehicle.</p>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate('/user/book')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
              <Calendar size={16} /> Book a parking slot
            </button>
            <button type="button" onClick={() => navigate('/user/services')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Nearby services</button>
          </div>
        </div>

        <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Registered vehicle</span>
            {defaultVehicle && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">{defaultVehicle.type}</span>}
          </div>
          {defaultVehicle ? (
            <div className="my-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Car size={27} /></div>
              <div className="min-w-0">
                <p className="break-all font-mono text-lg font-extrabold text-slate-900">{defaultVehicle.plate}</p>
                <p className="text-xs text-slate-500">{defaultVehicle.model || 'Vehicle'}{defaultVehicle.color ? ` · ${defaultVehicle.color}` : ''}</p>
              </div>
            </div>
          ) : (
            <div className="my-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Add a registered vehicle before booking.</div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="truncate text-slate-500">{user.phone}</span>
            <button type="button" onClick={() => navigate('/user/profile')} className="shrink-0 font-bold text-blue-700 hover:text-blue-900">Manage vehicle <ChevronRight size={13} className="inline" /></button>
          </div>
        </article>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
          <strong>{socketConnected ? 'Live updates connected' : 'Reconnecting to live updates'}</strong>
          <span className="hidden text-slate-600 sm:inline">· Slot PN-A-001 is wired for the designated sensor demo.</span>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-blue-700">Parking areas are demo data</span>
      </section>

      <LiveSensorDemoTrigger realSlot={realSlot} realSensor={realSensor} reservations={reservations} onTriggerComplete={onTriggerComplete} />

      <InteractiveMap
        parkingAreas={sortedAreas}
        onSelectArea={(area) => navigate(`/user/book?areaId=${area._id}`)}
        userLocation={location}
        locationStatus={locationStatus}
        onLocateMe={onLocateMe}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><MapPin size={18} className="text-blue-600" /> Nearby parking areas</h2>
            <p className="mt-1 text-xs text-slate-500">{location ? 'Distances use your current device location.' : 'Distances use the clearly marked demo location until location access is enabled.'}</p>
          </div>
          <button type="button" onClick={() => setSortByProximity(!sortByProximity)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <ArrowUpDown size={13} /> Sort by {sortByProximity ? 'availability' : 'distance'}
          </button>
        </div>
        {loadError && <div role="alert" className="mb-3 flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"><span>{loadError}</span><button type="button" onClick={fetchHomeData} className="font-semibold underline">Retry</button></div>}
        {loading ? <p className="py-5 text-center text-sm text-slate-500">Loading nearby parking…</p> : sortedAreas.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No parking areas found. Demo areas appear after the server is seeded.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedAreas.map((area) => (
              <article key={area._id || area.name} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{area.name}</h3>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">{area.availableSlots} available</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{area.location} · Demo area</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 text-blue-700"><Compass size={13} />{area.distanceKm !== null ? `${area.distanceKm.toFixed(1)} km` : 'Distance unavailable'}</span>
                    <span>{area.totalSlots ?? 0} total slots</span>
                  </div>
                </div>
                <button type="button" onClick={() => navigate(`/user/book?areaId=${area._id}`)} className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                  Select and book <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {activeReservations.length > 0 && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div><h2 className="flex items-center gap-2 font-bold text-slate-900"><Calendar size={17} className="text-blue-700" /> Your active reservations</h2><p className="text-xs text-slate-600">Reservation status is independent of the sensor reading.</p></div>
            <button type="button" onClick={() => navigate('/user/reservations')} className="text-xs font-bold text-blue-700">View all</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeReservations.slice(0, 2).map((reservation) => (
              <div key={reservation.reservationId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3">
                <div><p className="font-mono text-sm font-bold text-slate-900">{reservation.slotId} · {reservation.vehicleNumber}</p><p className="text-xs text-slate-500">Until {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">{reservation.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between gap-2">
          <div><h2 className="font-bold text-slate-900">Nearby mobility services</h2><p className="text-xs text-slate-500">Search Google Maps or open a quick guide.</p></div>
          <button type="button" onClick={() => navigate('/user/services')} className="text-xs font-bold text-blue-700">View all</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ id, title, description, icon: Icon, color }) => (
            <button key={id} type="button" onClick={() => navigate(`/user/services?tab=${id}`)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <span className={`inline-flex rounded-xl p-2.5 ${color}`}><Icon size={20} /></span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserHome;
