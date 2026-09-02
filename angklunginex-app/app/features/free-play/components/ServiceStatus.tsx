import type { WsStatus } from "../../../hooks/useGestureWs";

const statusDot: Record<WsStatus, string> = {
  connecting: "bg-yellow-400 animate-pulse",
  connected: "bg-green-400",
  disconnected: "bg-red-500",
};

const statusLabel: Record<WsStatus, string> = {
  connecting: "Menghubungkan...",
  connected: "Terhubung",
  disconnected: "Tidak terhubung",
};

interface ServiceStatusProps {
  status: WsStatus;
  url: string;
}

export function ServiceStatus({ status, url }: ServiceStatusProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Service</p>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
        <span className="text-sm text-gray-300">{statusLabel[status]}</span>
      </div>
      <p className="text-xs text-gray-600 font-mono mt-1">{url}</p>
    </div>
  );
}
