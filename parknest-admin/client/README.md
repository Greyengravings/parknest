# ParkNest client MVP

The client contains both the admin console and the driver app:

- Admin: `/#/` (dashboard), `/#/live-parking`, and `/#/reservations`
- Driver: `/#/user`, with booking, reservations, profile, and nearby services routes

## Run locally

Start the Express/MongoDB server first, then run:

```bash
npm install
npm run dev
```

The client uses `VITE_API_BASE_URL` and `VITE_SOCKET_URL` when set. In development it defaults to the backend at `http://localhost:5002`.

## Driver demo

- The first visit uses a local demo profile with sample vehicles. Sign out from the profile menu to try the phone sign-in screen.
- Phone OTP is a client-only demo: enter any 10-digit number and use `1234`. No SMS is sent and no authentication service is configured.
- The seed parking areas and sample service searches are demo data. Browser location permission is used for nearby sorting; the demo-area center is used when permission is unavailable.
- Nearby Maps and service searches are Google Maps embeds/search links.
- Slot `PN-A-001` is the designated physical-sensor slot. Its telemetry source is shown separately from its slot/reservation status. The three sensor buttons send simulated readings and are explicitly marked as simulation controls.

## Reservation and sensor behavior

- Active and pending bookings hold the slot as `RESERVED`, regardless of whether a sensor sees a car.
- Sensor distance is displayed independently, so a car occupying a reserved space does not erase the reservation state.
- Once a booking expires, an online sensor's latest reading determines `OCCUPIED` versus `AVAILABLE`. Offline and maintenance slots remain unavailable.
- The reservation expiry monitor runs with the server's sensor monitor and emits slot/reservation Socket.IO updates.
