import { Card } from "~/components/ui/card";
import { useHandGesture } from "~/hooks/useHandGesture";
import { GestureBadge } from "./hand-gesture-badge";

export function GestureInfo() {
  const { gestures } = useHandGesture();

  return (
    <Card className="p-4 rounded-[24px]">
      <div className="grid grid-cols-4 gap-3">
        {gestures.map(({ label, image }) => (
          <GestureBadge key={label} imageSrc={image} label={label} />
        ))}
      </div>
    </Card>
  )
}
