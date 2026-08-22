import { formatCurrency, formatDateTime } from '../utils';

export default function VehicleCard({ vehicle, index }) {
  return (
    <article className="vehicle-card" style={{ '--card-index': index }}>
      <div className="vehicle-accent" aria-hidden="true" />
      <div className="vehicle-details">
        <span className="manufacturer">{vehicle.manufacturer}</span>
        <h3>{vehicle.vehicle}</h3>
        <span className="retrieved">Retrieved {formatDateTime(vehicle.retrieved_at)}</span>
      </div>
      <div className="vehicle-price">
        <span>Starting price</span>
        <strong>{formatCurrency(vehicle.price)}</strong>
        {vehicle.source_url && (
          <a href={vehicle.source_url} target="_blank" rel="noreferrer">Official Source <span aria-hidden="true">↗</span></a>
        )}
      </div>
    </article>
  );
}
