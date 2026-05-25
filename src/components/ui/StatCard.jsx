export default function StatCard({ label, value }) {
  return (
    <div className="stat-item">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
