export function GestureBadge({
  imageSrc,
  label,
}: {
  imageSrc?: string
  label?: string
}) {
  return (
    <div className="flex w-33 flex-col gap-1.5">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-white ring-1 ring-foreground/10">
        {imageSrc ? (
          <img src={imageSrc} alt={label ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#9B9B9B]">
            —
          </div>
        )}
      </div>
      <p className="text-center text-sm text-[#9B9B9B]">{label ?? "Nada not detected"}</p>
    </div>
  )
}
