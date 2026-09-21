import Icon from "./Icon";

export default function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-space-xl px-space-md gap-space-sm">
      <div className="w-14 h-14 rounded-full bg-surface-canvas flex items-center justify-center text-tertiary">
        <Icon name={icon} size={28} />
      </div>
      <p className="text-title-sm text-on-surface">{title}</p>
      {description && <p className="text-body-sm text-tertiary max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
