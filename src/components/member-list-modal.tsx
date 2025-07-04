"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  joinDate: string;
  status: "active" | "inactive";
}

interface MemberListModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: string;
  members: Member[];
}

export function MemberListModal({ isOpen, onClose, segment, members }: MemberListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Member - {segment}
            <Badge variant="secondary">{members.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-emerald-100 text-emerald-600">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">Bergabung: {member.joinDate}</p>
              </div>
              <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
