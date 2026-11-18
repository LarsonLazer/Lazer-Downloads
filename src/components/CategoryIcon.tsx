import React from 'react';
import {
  BookOpen,
  Cpu,
  Folder,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Monitor,
  Music,
  Smartphone,
  Video,
  Wrench,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Monitor,
  Gamepad2,
  Music,
  Video,
  BookOpen,
  Cpu,
  Wrench,
  Image: ImageIcon,
  HardDrive,
  Folder,
};

export function CategoryIcon({
  name,
  className = 'w-5 h-5',
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Folder;
  return <Icon className={className} />;
}
