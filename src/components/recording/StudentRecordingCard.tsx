import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentRecordingCardProps {
  name: string;
  avatarUrl: string;
  understanding: number;
  attention: number;
  recordingTime: number;
  onBehaviorClick: () => void;
  isBehaviorSidebarOpen: boolean;
}

export function StudentRecordingCard({
  name,
  avatarUrl,
  understanding,
  attention,
  recordingTime,
  onBehaviorClick,
  isBehaviorSidebarOpen
}: StudentRecordingCardProps) {
  // This card is no longer used in RecordingPage
  return null;
}
