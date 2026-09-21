import Icon from "./Icon";

export default function StatCard({ label, value, icon, hint }) {
  return (
    <div className="card p-space-md flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col min-w-0">
          <span className="text-label-md text-tertiary">{label}</span>
          <span className="text-display-stat tracking-tight mt-1 truncate">{value}</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
          <Icon name={icon} size={26} />
        </div>
      </div>
      {hint && <span className="text-label-sm text-tertiary">{hint}</span>}
    </div>
  );
}
