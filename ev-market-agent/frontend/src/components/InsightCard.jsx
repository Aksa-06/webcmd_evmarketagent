import { formatCurrency } from '../utils';

export default function InsightCard({ insight }) {
  if (!insight) return <p className="empty-copy">No comparison is available yet.</p>;

  return (
    <div className="insight-card">
      <span className="insight-label">Price positioning</span>
      <h3>{insight.title}</h3>
      <p>{insight.finding}</p>
      <div className="insight-stats">
        <div><span>Difference</span><strong>{formatCurrency(insight.price_difference)}</strong></div>
        <div><span>Percentage</span><strong>{insight.price_difference_percent}%</strong></div>
      </div>
    </div>
  );
}
