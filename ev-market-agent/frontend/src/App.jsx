import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import InsightCard from './components/InsightCard';
import LoadingState from './components/LoadingState';
import PriceComparison from './components/PriceComparison';
import VehicleCard from './components/VehicleCard';
import { fetchJson } from './api';
import { formatCurrency, formatDateTime } from './utils';
import './styles.css';

function uniqueVehicles(vehicles) {
  return [...new Map(vehicles.map((vehicle) => [`${vehicle.manufacturer}-${vehicle.vehicle}`, vehicle])).values()];
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const initialLoadStarted = useRef(false);

  async function loadDashboard() {
    setLoading(true);
    setError(false);
    try {
      const healthData = await fetchJson('/health');
      const vehicleData = await fetchJson('/api/vehicles');
      const insightData = await fetchJson('/api/insights');
      setHealth(healthData);
      setVehicles(uniqueVehicles(vehicleData.vehicles || []));
      setInsights(insightData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    loadDashboard();
  }, []);

  const pricedVehicles = vehicles.filter((vehicle) => vehicle.price != null);
  const manufacturers = new Set(vehicles.map((vehicle) => vehicle.manufacturer));
  const lowestPrice = pricedVehicles.length ? Math.min(...pricedVehicles.map((vehicle) => vehicle.price)) : null;
  const highestPrice = pricedVehicles.length ? Math.max(...pricedVehicles.map((vehicle) => vehicle.price)) : null;
  const updatedAt = insights?.generated_at || health?.timestamp;

  return (
    <div className="app-shell">
      <Header loading={loading} onRefresh={loadDashboard} />
      <main>
        <section className="hero">
          <div>
            <p className="section-kicker">Live market desk <span>///</span> India</p>
            <h1>The electric shift,<br /><em>priced clearly.</em></h1>
            <p className="hero-copy">A live view of Indian EV pricing, collected from official manufacturer sources and distilled into a decision-ready comparison.</p>
          </div>
          <div className="hero-stamp" aria-hidden="true"><span>LIVE</span><strong>EV<br />/25</strong></div>
        </section>

        {error ? (
          <section className="error-banner" role="alert">
            <strong>Unable to connect to the EV Market Intelligence backend.</strong>
            <span>Make sure the FastAPI backend is running.</span>
            <button type="button" onClick={loadDashboard}>Try again</button>
          </section>
        ) : loading ? <LoadingState label="Collecting live manufacturer data..." /> : (
          <>
            <section className="metric-grid" aria-label="Market overview">
              <div className="metric-card metric-highlight"><span>EVs tracked</span><strong>{vehicles.length}</strong><small>Across {manufacturers.size} manufacturers</small></div>
              <div className="metric-card"><span>Lowest starting price</span><strong>{formatCurrency(lowestPrice)}</strong><small>Current market floor</small></div>
              <div className="metric-card"><span>Highest starting price</span><strong>{formatCurrency(highestPrice)}</strong><small>Current market ceiling</small></div>
              <div className="metric-card"><span>Last updated</span><strong className="metric-date">{formatDateTime(updatedAt)}</strong><small>Verified live response</small></div>
            </section>

            <div className="section-heading"><div><p className="section-kicker">01 / Market scan</p><h2>Vehicles in view</h2></div><span>{vehicles.length} live records</span></div>
            <section className="vehicle-list" aria-label="Live vehicle prices">
              {vehicles.map((vehicle, index) => <VehicleCard key={`${vehicle.manufacturer}-${vehicle.vehicle}`} vehicle={vehicle} index={index} />)}
            </section>

            <section className="lower-grid">
              <div>
                <div className="section-heading"><div><p className="section-kicker">02 / Price map</p><h2>Starting price comparison</h2></div></div>
                <div className="comparison-panel"><PriceComparison vehicles={vehicles} /></div>
              </div>
              <div>
                <div className="section-heading"><div><p className="section-kicker">03 / Intelligence</p><h2>Market signal</h2></div></div>
                <InsightCard insight={insights?.insights?.[0]} />
              </div>
            </section>
          </>
        )}
      </main>
      <footer><span>EV MARKET INTELLIGENCE / WEBcmd LIVE DATA</span><span>Prices sourced from official manufacturer websites</span></footer>
    </div>
  );
}
