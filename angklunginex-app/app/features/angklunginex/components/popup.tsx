"use client"

import { useState } from "react"
import { TextAlignJustify, X, KeyboardMusic, Check } from "lucide-react"
import { Switch } from "~/components/ui/switch"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export function MenuButton({
  showGesture,
  onShowGestureChange,
  cameraOn,
  onCameraChange,
  devices,
  selectedDeviceId,
  onDeviceChange,
}: {
  showGesture: boolean
  onShowGestureChange: (checked: boolean) => void
  cameraOn: boolean
  onCameraChange: (checked: boolean) => void
  devices: { deviceId: string; label: string }[]
  selectedDeviceId?: string
  onDeviceChange: (deviceId: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          className="
            flex h-12 w-12 items-center justify-center
            rounded-full
            bg-white
            shadow-md
            transition
            hover:bg-gray-50
          "
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <TextAlignJustify className="h-5 w-5" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-72 rounded-3xl p-4"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Optional
          </p>

          <div className="flex items-center justify-between">
            <span>Kamera</span>

            <Switch
              checked={cameraOn}
              onCheckedChange={onCameraChange}
            />
          </div>

          {cameraOn && devices.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Pilih kamera</span>
              <select
                value={selectedDeviceId ?? devices[0]?.deviceId ?? ""}
                onChange={(e) => onDeviceChange(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Show gesture</span>

            <Switch
              checked={showGesture}
              onCheckedChange={onShowGestureChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Show nada</span>

            <Switch defaultChecked />
          </div>

          <div>
            <p className="mb-3 text-sm text-gray-400">
              Modes
            </p>

            <div className="space-y-3">
              <button className="flex w-full items-center justify-between">
                <span className="flex gap-2">
                  <KeyboardMusic className="w-6 h-5"/> Piano
                </span>
              </button>

              <button className="flex w-full items-center justify-between">
                <span className="flex gap-2">
                  <img src="/angklung.png" alt="Piano" className="size-6" /> Angklung
                </span>
                <span><Check className="text-[#545454] size-5"/></span>
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}