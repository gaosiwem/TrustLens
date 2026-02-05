"use client";

import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { UserPlus, Check, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import { toast } from "sonner";
import clsx from "clsx";

interface AssigneeSelectProps {
  complaintId: string;
  brandId: string;
  currentAssigneeId?: string | null;
  onAssign?: (user: any) => void;
}

export function AssigneeSelect({
  complaintId,
  brandId,
  currentAssigneeId,
  onAssign,
}: AssigneeSelectProps) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [currentId, setCurrentId] = useState(currentAssigneeId || null);

  useEffect(() => {
    setCurrentId(currentAssigneeId || null);
    loadMembers();
  }, [currentAssigneeId, brandId]);

  const loadMembers = async () => {
    if (loading || members.length > 0) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/team`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: string | null) => {
    if (userId === currentId) return;
    setAssigning(true);
    try {
      const payload =
        userId === null ? { assignedToId: null } : { assignedToId: userId };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/complaints/${complaintId}/assign`,
        payload,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );

      setCurrentId(userId);
      toast.success(
        userId === null
          ? "Complaint unassigned"
          : "Complaint assigned successfully",
      );
      if (onAssign)
        onAssign(
          userId === null ? null : members.find((m) => m.userId === userId),
        );
    } catch (err) {
      toast.error("Failed to assign ticket");
    } finally {
      setAssigning(false);
    }
  };

  // Resolve current member name
  const currentMember = members.find((m) => m.userId === currentId);
  const displayName = currentMember
    ? currentMember.name || currentMember.email
    : "Unassigned";

  return (
    <div className="w-full max-w-[240px]">
      {/* Label matching InputField */}
      <label className="text-foreground text-sm font-medium mb-1.5 block">
        Assigned To
      </label>

      <Menu as="div" className="relative w-full">
        <Menu.Button
          className={clsx(
            "input-base w-full h-12 px-4 flex items-center justify-between",
            "bg-background text-left transition-all",
            loading ? "opacity-70 cursor-wait" : "cursor-pointer",
          )}
        >
          <span className="flex items-center gap-3 truncate">
            <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
            <span
              className={clsx(
                "truncate text-sm",
                !currentMember && "text-muted-foreground",
              )}
            >
              {loading && members.length === 0
                ? "Loading team..."
                : displayName}
            </span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-1.5 w-full origin-top-right rounded-xl bg-white dark:bg-[#1a2c34] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border max-h-60 overflow-auto">
            <div className="p-1 space-y-0.5">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleAssign(null)}
                    disabled={assigning}
                    className={clsx(
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground",
                      "group flex w-full items-center rounded-lg px-2 py-2.5 text-sm transition-colors",
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center mr-3 bg-muted/50">
                      <UserPlus className="w-4 h-4 opacity-50" />
                    </div>
                    Unassigned
                    {currentId === null && (
                      <Check className="ml-auto w-4 h-4 text-primary" />
                    )}
                  </button>
                )}
              </Menu.Item>

              {members.map((member) => (
                <Menu.Item key={member.userId}>
                  {({ active }) => (
                    <button
                      onClick={() => handleAssign(member.userId)}
                      disabled={assigning}
                      className={clsx(
                        active
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-foreground",
                        "group flex w-full items-center rounded-lg px-2 py-2.5 text-sm transition-colors",
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs font-bold">
                        {(member.name || member.email)[0].toUpperCase()}
                      </div>
                      {member.name || member.email}
                      {currentId === member.userId && (
                        <Check className="ml-auto w-4 h-4 text-primary" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
