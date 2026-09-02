import type { ReactNode } from "react"
import { cn } from "~/lib/utils"

export function BadgeInfoPanel({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("py-2 px-4 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.12)]", className)}>
      <h1 className="text-[14px] text-[#9B9B9B]">{children}</h1>
    </div>
  )
}
