"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import DataTable, { Column } from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "BRAND" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}

const ROLES = ["USER", "BRAND", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

export default function UserManager() {
  const { data: session } = useSession();
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState("");
  const [updating, setUpdating] = useState(false);

  const [params, setParams] = useState({
    limit: 20,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  });

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params,
      });
      setData(res.data.items);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!selected || !session?.accessToken || updating) return;
    setUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.patch(
        `${apiUrl}/users/${selected.id}`,
        { role: editRole },
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      setSelected(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setUpdating(false);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      header: "User",
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-bold">{item.name || "N/A"}</span>
          <span className="text-xs text-muted-foreground">{item.email}</span>
        </div>
      ),
      sortable: true,
      sortKey: "email",
    },
    {
      header: "Role",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
            item.role === "ADMIN" || item.role === "SUPER_ADMIN"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              : item.role === "MODERATOR"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : item.role === "BRAND"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {item.role}
        </span>
      ),
      sortable: true,
      sortKey: "role",
    },
    {
      header: "Joined",
      accessor: (item) => (
        <span className="text-muted-foreground" suppressHydrationWarning>
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: "createdAt",
    },
    {
      header: "Actions",
      accessor: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelected(item);
            setEditRole(item.role);
          }}
          className="text-primary hover:text-primary/80 transition-colors text-xs font-semibold"
        >
          Edit Role
        </button>
      ),
    },
  ];

  const handleParamsChange = useCallback((newParams: any) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        loading={loading}
        limit={params.limit}
        offset={params.offset}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onParamsChange={handleParamsChange}
        onRowClick={(item) => {
          setSelected(item);
          setEditRole(item.role);
        }}
        searchPlaceholder="Search users by name or email..."
      />

      {/* Edit Role Modal */}
      <Dialog open={!!selected} onOpenChange={(op) => !op && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(
                  selected?.name?.[0] ||
                  selected?.email?.[0] ||
                  "?"
                ).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{selected?.name || "N/A"}</p>
                <p className="text-xs text-muted-foreground">
                  {selected?.email}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 block">
                Access Level
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                {editRole === "SUPER_ADMIN" &&
                  "Full platform control including audit access."}
                {editRole === "ADMIN" &&
                  "Standard operational management access."}
                {editRole === "MODERATOR" &&
                  "Limited access for complaint resolution only."}
                {editRole === "BRAND" &&
                  "Authenticated brand representative access."}
                {editRole === "USER" &&
                  "Standard public-facing account rights."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={updating || editRole === selected?.role}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updating ? "Saving..." : "Update Access"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
