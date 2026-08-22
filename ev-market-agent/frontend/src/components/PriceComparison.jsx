import { formatCurrency } from '../utils';

export default function PriceComparison({ vehicles }) {
  const pricedVehicles = vehicles.filter((vehicle) => vehicle.price != null);
  if (pricedVehicles.length < 2) return <p className="empty-copy">At least two priced vehicles are needed for comparison.</p>;

  const highestPrice = Math.max(...pricedVehicles.map((vehicle) => vehicle.price));
  const lowestVehicle = pricedVehicles.reduce((lowest, vehicle) => vehicle.price < lowest.price ? vehicle : lowest);

  return (
    <div className="comparison-list">
      {pricedVehicles.map((vehicle) => (
        <div className="comparison-row" key={`${vehicle.manufacturer}-${vehicle.vehicle}`}>
          <div className="comparison-name"><span>{vehicle.manufacturer}</span><strong>{vehicle.vehicle}</strong></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(vehicle.price / highestPrice) * 100}%` }} /></div>
          <strong className="comparison-price">{formatCurrency(vehicle.price)}</strong>
        </div>
      ))}
      <p className="comparison-note"><span aria-hidden="true">↓</span> {lowestVehicle.vehicle} has the lower starting price.</p>
    </div>
  );
}
