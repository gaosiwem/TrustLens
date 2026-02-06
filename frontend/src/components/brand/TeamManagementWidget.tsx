"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Users, Plus, Trash2, Mail } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { toast } from "sonner";
import StandardLoader from "../StandardLoader";

interface TeamMember {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  joinedAt: string;
}

export default function TeamManagementWidget() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // @ts-ignore
  const brandId = session?.user?.brandId;

  useEffect(() => {
    if (brandId) fetchMembers();
  }, [brandId, session]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/team`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/team/invite`,
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      toast.success("Team member invited successfully!");
      setInviteEmail("");
      fetchMembers();
    } catch (err: any) {
      toast.error("Could not invite user. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/team/${userId}`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      toast.success("Member removed");
      setMembers(members.filter((m) => m.userId !== userId));
    } catch (err) {
      toast.error("Failed to remove member. Please try again.");
    }
  };

  if (loading) return <StandardLoader />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Team Management
        </CardTitle>
        <CardDescription>
          Invite colleagues to help manage complaints and responses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="colleague@company.com"
              className="pl-9"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <Button type="submit" disabled={inviting}>
            {inviting ? (
              "Inviting..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Invite
              </>
            )}
          </Button>
        </form>

        {/* Member List */}
        <div className="space-y-3">
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No other team members yet.
            </p>
          )}
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                  {member.role}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(member.userId)}
                  // Disabled removing self logic can be handled here if we check session.user.id
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
