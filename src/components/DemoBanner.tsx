export function DemoBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="card-ink mx-5 mt-3 rounded-2xl px-4 py-2.5 text-center"
      style={{ background: "#AFC6E9", fontSize: 12.5, fontWeight: 700 }}
    >
      🍟 Demo mode — showing sample data. Connect Neon to save your own.
    </div>
  );
}
