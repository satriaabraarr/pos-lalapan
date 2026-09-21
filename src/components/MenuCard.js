"use client";
import Icon from "./Icon";
import { rupiah } from "@/lib/format";

export default function MenuCard({ menu, onAdd, qty = 0 }) {
  const disabled = !menu.isAvailable;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onAdd(menu)}
      className={`card overflow-hidden text-left flex flex-col transition-all group
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md active:scale-[0.99]"}
        ${qty > 0 ? "ring-2 ring-primary-container" : ""}`}
    >
      <div className="relative aspect-[4/3] bg-surface-canvas flex items-center justify-center overflow-hidden">
        {menu.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.imageUrl}
            alt={menu.name}
            className={`w-full h-full object-cover ${disabled ? "grayscale" : ""}`}
          />
        ) : (
          <Icon name={menu.category === "Minuman" ? "local_cafe" : "restaurant"} size={36} className="text-border-subtle" />
        )}

        {disabled && (
          <span className="absolute top-2 left-2 badge-muted bg-white/90">Habis</span>
        )}
        {qty > 0 && (
          <span className="absolute top-2 right-2 min-w-6 h-6 px-1.5 rounded-full bg-primary-container text-white text-label-sm font-bold flex items-center justify-center">
            {qty}
          </span>
        )}
      </div>

      <div className="p-space-sm sm:p-space-md flex flex-col gap-0.5">
        <span className="text-title-sm line-clamp-1">{menu.name}</span>
        <span className="text-label-sm text-tertiary">{menu.category}</span>
        <span className="text-price-lg text-primary-container mt-1">{rupiah(menu.price)}</span>
      </div>
    </button>
  );
}
