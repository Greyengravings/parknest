const axios = require('axios');

const PORT = process.env.PORT || 5002;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const API_URL = process.env.API_URL || `${BASE_URL}/api/sensors/update`;

// Fallback slot list if DB fetch is unavailable
let SLOTS = [
  { slotId: 'PN-A-001', sensorId: 'PN-SENSOR-001', threshold: 10 },
  { slotId: 'PN-A-002', sensorId: 'PN-SENSOR-002', threshold: 10 },
  { slotId: 'PN-A-003', sensorId: 'PN-SENSOR-003', threshold: 10 },
  { slotId: 'PN-A-004', sensorId: 'PN-SENSOR-004', threshold: 10 },
  { slotId: 'PN-A-005', sensorId: 'PN-SENSOR-005', threshold: 10 }
];

async function loadActiveSlots() {
  try {
    const res = await axios.get(`${BASE_URL}/api/parking/slots`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      SLOTS = res.data.map(slot => ({
        slotId: slot.slotId,
        sensorId: slot.sensorId || `PN-SENSOR-${slot.slotId}`,
        threshold: slot.threshold || 10
      }));
      console.log(`[Simulator] Loaded ${SLOTS.length} slots from backend database.`);
    }
  } catch (err) {
    console.warn(`[Simulator] Could not fetch live slots from DB (${err.message}). Using default fallback slots.`);
  }
}

async function simulate() {
  console.log('Starting ParkNest IoT simulator...');
  console.log(`API endpoint: ${API_URL}`);

  await loadActiveSlots();

  setInterval(async () => {
    if (SLOTS.length === 0) return;

    // Select a random slot
    const index = Math.floor(Math.random() * SLOTS.length);
    const selectedSlot = SLOTS[index];

    // Generate a realistic simulated distance measurement in cm (2 to 35 cm)
    const distance = Math.floor(Math.random() * 33) + 2;

    // Apply distance threshold
    const occupied = distance < selectedSlot.threshold;

    try {
      const response = await axios.post(API_URL, {
        sensorId: selectedSlot.sensorId,
        slotId: selectedSlot.slotId,
        distance,
        occupied,
        firmwareVersion: '1.0.3',
        ipAddress: '127.0.0.1'
      });

      console.log(
        `[Simulator] ${selectedSlot.slotId} | ` +
        `${selectedSlot.sensorId} | ` +
        `${occupied ? 'OCCUPIED' : 'AVAILABLE'} | ` +
        `${distance} cm | HTTP ${response.status}`
      );

    } catch (error) {
      console.error(
        `[Simulator] Failed for ${selectedSlot.slotId}:`,
        error.response?.status || error.message,
        error.response?.data?.message || error.response?.data || ''
      );
    }
  }, 4000);
}

simulate();
