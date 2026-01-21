"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getAssetUrl } from "../../../lib/utils";
import DataTable, { Column } from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
  subscription?: {
    id: string;
    status: string;
    plan: { code: string; name: string; monthlyPrice: number };
  };
}
export default function BrandManager() {
  const { data: session } = useSession();
  const [data, setData] = useState<BrandItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newBrand, setNewBrand] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<BrandItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [params, setParams] = useState({
    limit: 20,
    offset: 0,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    search: "",
  });
  const fetchBrands = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/brands`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params,
      });
      setData(res.data.items);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params]);
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !session?.accessToken || adding) return;
    setAdding(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const formData = new FormData();
      formData.append("name", newBrand);
      if (newLogoFile) {
        formData.append("logo", newLogoFile);
      } else if (newLogoUrl) {
        formData.append("logoUrl", newLogoUrl);
      }
      await axios.post(`${apiUrl}/brands`, formData, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setNewBrand("");
      setNewLogoUrl("");
      setNewLogoFile(null);
      setShowAddModal(false);
      fetchBrands();
    } catch (error) {
      console.error("Failed to add brand:", error);
    } finally {
      setAdding(false);
    }
  };
  const handleUpdateBrand = async () => {
    if (!selected || !session?.accessToken || updating) return;
    setUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const formData = new FormData();
      formData.append("name", editName);
      if (editLogoFile) {
        formData.append("logo", editLogoFile);
      } else {
        formData.append("logoUrl", editLogoUrl);
      }
      await axios.patch(`${apiUrl}/brands/${selected.id}`, formData, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setSelected(null);
      setEditLogoFile(null);
      fetchBrands();
    } catch (error) {
      console.error("Failed to update brand:", error);
    } finally {
      setUpdating(false);
    }
  };
  const toggleVerification = async (id: string) => {
    if (!session?.accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.patch(
        `${apiUrl}/brands/${id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
      );
      fetchBrands();
    } catch (error) {
      console.error("Failed to toggle verification:", error);
    }
  };
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This may affect existing complaints.",
      ) ||
      !session?.accessToken
    )
      return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.delete(`${apiUrl}/brands/${id}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      fetchBrands();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };
  const columns: Column<BrandItem>[] = [
    {
      header: "Logo",
      accessor: (item) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-border flex items-center justify-center shadow-sm">
          {" "}
          {item.logoUrl ? (
            <img
              src={getAssetUrl(item.logoUrl)}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">
              {" "}
              NO LOGO{" "}
            </span>
          )}{" "}
        </div>
      ),
    },
    {
      header: "Name",
      accessor: (item) => (
        <span className="capitalize font-medium">{item.name}</span>
      ),
      sortable: true,
      sortKey: "name",
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${item.isVerified ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}
        >
          {" "}
          {item.isVerified ? "Verified" : "Unverified"}{" "}
        </span>
      ),
      sortable: true,
      sortKey: "isVerified",
    },
    {
      header: "Created",
      accessor: (item) => (
        <span className="text-muted-foreground" suppressHydrationWarning>
          {" "}
          {new Date(item.createdAt).toLocaleDateString()}{" "}
        </span>
      ),
      sortable: true,
      sortKey: "createdAt",
    },
    {
      header: "Plan",
      accessor: (item) => (
        <span className="text-sm font-medium">
          {" "}
          {item.subscription?.plan?.code ? (
            item.subscription.plan.code.replace(/_/g, " ")
          ) : (
            <span className="text-muted-foreground">FREE</span>
          )}{" "}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: (item) => (
        <span className="text-sm font-bold">
          {" "}
          {item.subscription?.plan?.monthlyPrice ? (
            `R${(item.subscription.plan.monthlyPrice / 100).toFixed(2)}`
          ) : (
            <span className="text-muted-foreground italic">-</span>
          )}{" "}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          className="text-red-500 hover:text-red-700 transition-colors text-xs font-semibold"
        >
          {" "}
          Delete{" "}
        </button>
      ),
    },
  ];
  const handleParamsChange = useCallback((newParams: any) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);
  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-center">
        {" "}
        <h2 className="text-xl font-bold">Brand Directory</h2>{" "}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {" "}
          <span className="material-symbols-outlined text-lg">add</span> Add
          Brand{" "}
        </button>{" "}
      </div>{" "}
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
          setEditName(item.name);
          setEditLogoUrl(item.logoUrl || "");
          setEditLogoFile(null);
        }}
        searchPlaceholder="Search brands..."
      />{" "}
      {/* Add Brand Modal */}{" "}
      <Dialog
        open={showAddModal}
        onOpenChange={(op) => !op && !adding && setShowAddModal(false)}
      >
        {" "}
        <DialogContent className="max-w-md">
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle>Add New Brand</DialogTitle>{" "}
          </DialogHeader>{" "}
          <form onSubmit={handleAddBrand} className="space-y-4 pt-4">
            {" "}
            <div>
              {" "}
              <label className="text-xs font-bold text-muted-foreground tracking-wider mb-2 block">
                {" "}
                Brand Name{" "}
              </label>{" "}
              <input
                type="text"
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Apple, Samsung, Nike..."
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />{" "}
            </div>{" "}
            <div className="space-y-4">
              {" "}
              <label className="text-xs font-bold text-muted-foreground tracking-wider block">
                {" "}
                Brand Logo{" "}
              </label>{" "}
              <div className="space-y-2">
                {" "}
                <p className="text-[10px] text-muted-foreground italic">
                  {" "}
                  Choice A: Provide a URL{" "}
                </p>{" "}
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://example.com/logo.png"
                  value={newLogoUrl}
                  onChange={(e) => {
                    setNewLogoUrl(e.target.value);
                    setNewLogoFile(null);
                  }}
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <p className="text-[10px] text-muted-foreground italic">
                  {" "}
                  Choice B: Upload a file{" "}
                </p>{" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <label className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors flex items-center gap-2 shrink-0">
                    {" "}
                    <span className="material-symbols-outlined text-lg">
                      {" "}
                      upload_file{" "}
                    </span>{" "}
                    {newLogoFile ? "Change File" : "Choose File"}{" "}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.svg,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewLogoFile(file);
                          setNewLogoUrl("");
                        }
                      }}
                    />{" "}
                  </label>{" "}
                  {newLogoFile && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                      {" "}
                      {newLogoFile.name}{" "}
                    </span>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              {(newLogoUrl || newLogoFile) && (
                <div className="mt-2 p-2 border border-dashed border-border rounded-lg flex items-center gap-3">
                  {" "}
                  <div className="w-16 h-16 rounded-lg bg-white border border-border overflow-hidden shadow-sm">
                    {" "}
                    <img
                      src={
                        newLogoFile
                          ? URL.createObjectURL(newLogoFile)
                          : newLogoUrl
                      }
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />{" "}
                  </div>{" "}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    Logo Preview{" "}
                  </span>{" "}
                </div>
              )}{" "}
            </div>{" "}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {" "}
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                disabled={adding}
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                type="submit"
                disabled={adding || !newBrand.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {" "}
                {adding ? "Adding..." : "Add Brand"}{" "}
              </button>{" "}
            </div>{" "}
          </form>{" "}
        </DialogContent>{" "}
      </Dialog>{" "}
      {/* Edit Brand Modal */}{" "}
      <Dialog open={!!selected} onOpenChange={(op) => !op && setSelected(null)}>
        {" "}
        <DialogContent className="max-w-md">
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle>Edit Brand</DialogTitle>{" "}
          </DialogHeader>{" "}
          <div className="space-y-4 pt-4">
            {" "}
            <div>
              {" "}
              <label className="text-xs font-bold text-muted-foreground tracking-wider mb-2 block">
                {" "}
                Brand Name{" "}
              </label>{" "}
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />{" "}
            </div>{" "}
            <div className="space-y-4">
              {" "}
              <label className="text-xs font-bold text-muted-foreground tracking-wider block">
                {" "}
                Brand Logo{" "}
              </label>{" "}
              <div className="space-y-2">
                {" "}
                <p className="text-[10px] text-muted-foreground italic">
                  {" "}
                  Provide a URL{" "}
                </p>{" "}
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editLogoUrl}
                  onChange={(e) => {
                    setEditLogoUrl(e.target.value);
                    setEditLogoFile(null);
                  }}
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <p className="text-[10px] text-muted-foreground italic">
                  {" "}
                  Or upload a file{" "}
                </p>{" "}
                <input
                  type="file"
                  accept="image/*,.svg,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditLogoFile(file);
                    }
                  }}
                  className="text-xs text-muted-foreground"
                />{" "}
              </div>{" "}
              {(editLogoUrl || editLogoFile) && (
                <div className="mt-2 p-2 border border-dashed border-border rounded-lg flex items-center gap-3">
                  {" "}
                  <div className="w-16 h-16 rounded-xl bg-white border border-border overflow-hidden shadow-sm">
                    {" "}
                    <img
                      src={
                        editLogoFile
                          ? URL.createObjectURL(editLogoFile)
                          : getAssetUrl(editLogoUrl)
                      }
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />{" "}
                  </div>{" "}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    Logo Preview{" "}
                  </span>{" "}
                </div>
              )}{" "}
            </div>{" "}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {" "}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                disabled={updating}
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                onClick={handleUpdateBrand}
                disabled={
                  updating ||
                  (editName === selected?.name &&
                    editLogoUrl === (selected?.logoUrl || "") &&
                    !editLogoFile)
                }
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {" "}
                {updating ? "Saving..." : "Save Changes"}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </DialogContent>{" "}
      </Dialog>{" "}
    </div>
  );
}
