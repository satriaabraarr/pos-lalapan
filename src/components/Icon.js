export default function Icon({ name, size = 20, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{ fontSize: `${size}px` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
