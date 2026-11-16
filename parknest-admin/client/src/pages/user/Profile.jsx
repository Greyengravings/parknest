import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Car, Check, Plus, Star, Trash2, UserRound } from 'lucide-react';

const Profile = () => {
  const { user, addVehicle, deleteVehicle, setDefaultVehicle, updateProfile } = useUser();
  const [name, setName] = useState(user.name || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [vehicle, setVehicle] = useState({ plate: '', type: 'Sedan', model: '', color: '' });
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleActionId, setVehicleActionId] = useState('');

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      await updateProfile({ name: name.trim() || user.name });
      setProfileSaved(true);
      window.setTimeout(() => setProfileSaved(false), 2500);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitVehicle = async (event) => {
    event.preventDefault();
    const plate = vehicle.plate.trim().toUpperCase();
    if (!plate) {
      setError('Enter the vehicle number plate.');
      return;
    }
    if (user.vehicles.some((registered) => registered.plate === plate)) {
      setError('That number plate is already registered.');
      return;
    }
    setError('');
    setSavingVehicle(true);
    try {
      await addVehicle({ ...vehicle, plate });
      setVehicle({ plate: '', type: 'Sedan', model: '', color: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not add this vehicle.');
    } finally {
      setSavingVehicle(false);
    }
  };

  const updateVehicle = async (action, id) => {
    setError('');
    setVehicleActionId(id);
    try {
      await action(id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not update this vehicle.');
    } finally {
      setVehicleActionId('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">ACCOUNT</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Profile & vehicles</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the details used for your parking reservations.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><UserRound size={18} className="text-blue-600" /> Contact details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone number
            <input value={user.phone} readOnly className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600" />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={savingProfile} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">{savingProfile ? 'Saving…' : 'Save profile'}</button>
          {profileSaved && <span role="status" className="flex items-center gap-1 text-sm font-medium text-emerald-700"><Check size={15} /> Saved</span>}
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><Car size={18} className="text-blue-600" /> Registered vehicles</h2>
            <p className="mt-1 text-sm text-slate-500">Your default vehicle is preselected when booking.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{user.vehicles.length}</span>
        </div>

        {user.vehicles.length === 0 ? (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Add a vehicle to reserve parking.</p>
        ) : (
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            {user.vehicles.map((registered) => (
              <article key={registered.id} className={`rounded-xl border p-4 ${registered.isDefault ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold tracking-wide text-slate-900">{registered.plate}</span>
                      {registered.isDefault && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-800">Default</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{registered.type} · {registered.model || 'Model not set'}{registered.color ? ` · ${registered.color}` : ''}</p>
                  </div>
                  <button type="button" disabled={Boolean(vehicleActionId)} aria-label={`Remove ${registered.plate}`} onClick={() => updateVehicle(deleteVehicle, registered.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
                </div>
                {!registered.isDefault && (
                  <button type="button" disabled={Boolean(vehicleActionId)} onClick={() => updateVehicle(setDefaultVehicle, registered.id)} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50">
                    <Star size={14} /> Make default
                  </button>
                )}
              </article>
            ))}
          </div>
        )}

        <form onSubmit={submitVehicle} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Add a vehicle</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">
              Number plate *
              <input required value={vehicle.plate} onChange={(event) => setVehicle({ ...vehicle, plate: event.target.value.toUpperCase() })} placeholder="MH-02-CB-4321" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase outline-none focus:border-blue-500" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Vehicle type *
              <select value={vehicle.type} onChange={(event) => setVehicle({ ...vehicle, type: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option>Sedan</option><option>SUV</option><option>Hatchback</option><option>EV</option><option>Bike</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Model
              <input value={vehicle.model} onChange={(event) => setVehicle({ ...vehicle, model: event.target.value })} placeholder="e.g. Honda City" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Color
              <input value={vehicle.color} onChange={(event) => setVehicle({ ...vehicle, color: event.target.value })} placeholder="e.g. White" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </label>
          </div>
          <button type="submit" disabled={savingVehicle} className="mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
            <Plus size={16} /> {savingVehicle ? 'Adding…' : 'Add vehicle'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;
