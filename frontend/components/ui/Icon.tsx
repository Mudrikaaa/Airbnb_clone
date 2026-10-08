import {
  AirVent,
  AlarmSmoke,
  Bath,
  BriefcaseMedical,
  Building2,
  Car,
  Castle,
  Coffee,
  CookingPot,
  Croissant,
  Dumbbell,
  Flame,
  Heater,
  KeyRound,
  Landmark,
  Laptop,
  LayoutGrid,
  type LucideIcon,
  Mountain,
  MountainSnow,
  PawPrint,
  Sailboat,
  Sun,
  Tractor,
  TreePalm,
  TreePine,
  Trees,
  Tv,
  Umbrella,
  WashingMachine,
  Waves,
  Wifi,
} from "lucide-react";

// The backend sends icon *names* (categories, amenities). Mapping them explicitly keeps the bundle
// small — importing lucide's whole `icons` object would ship ~1,500 icons we never use.
const ICONS: Record<string, LucideIcon> = {
  AirVent, AlarmSmoke, Bath, BriefcaseMedical, Building2, Car, Castle, Coffee, CookingPot, Croissant,
  Dumbbell, Flame, Heater, KeyRound, Landmark, Laptop, LayoutGrid, Mountain, MountainSnow, PawPrint, Sailboat,
  Sun, Tractor, TreePalm, TreePine, Trees, Tv, Umbrella, WashingMachine, Waves, Wifi,
};

type Props = { name: string; size?: number; strokeWidth?: number; className?: string };

export function Icon({ name, size = 24, strokeWidth = 1.5, className }: Props) {
  const Component = ICONS[name] ?? LayoutGrid;
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
