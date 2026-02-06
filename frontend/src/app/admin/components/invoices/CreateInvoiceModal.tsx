import { useState, useEffect } from "react";
import axios from "axios";

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

interface Brand {
  id: string;
  name: string;
  isVerified: boolean;
}

export default function CreateInvoiceModal({
  onClose,
  onSuccess,
  token,
}: CreateInvoiceModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const queryParam = searchQuery
          ? `&search=${encodeURIComponent(searchQuery)}`
          : "";
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/brands?limit=10&sortBy=name${queryParam}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const brandList = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.brands || [];
        setBrands(brandList);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBrands();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [token, searchQuery]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payloadItems = items.map((item) => ({
        ...item,
        unitPrice: Math.round(Number(item.unitPrice) * 100),
      }));

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/admin/invoices`,
        {
          brandId: selectedBrand,
          items: payloadItems,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        "Something went wrong while creating the invoice. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-2xl rounded-lg border border-border shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold tracking-tight">
            Create Manual Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-md text-sm border border-red-200 dark:border-red-900/20">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 relative z-50">
              <label className="text-sm font-medium">Select Brand</label>
              <div className="relative">
                <div className="flex items-center border border-input rounded-md bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <span className="material-symbols-outlined text-muted-foreground ml-3 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search brand name..."
                    value={selectedBrandName}
                    onChange={(e) => {
                      setSelectedBrandName(e.target.value);
                      setSelectedBrand(""); // Clear selection on type
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full px-3 py-2 text-sm bg-transparent border-0 focus:ring-0 outline-none placeholder:text-muted-foreground/50"
                  />
                  {selectedBrandName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrandName("");
                        setSelectedBrand("");
                        setSearchQuery("");
                        setIsDropdownOpen(false);
                      }}
                      className="mr-3 text-muted-foreground hover:text-foreground"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 z-[100] w-full mt-1 bg-card text-card-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto ring-1 ring-black/5">
                    {brands.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        {loading && searchQuery
                          ? "Searching..."
                          : "No brands found"}
                      </div>
                    ) : (
                      brands.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b.id);
                            setSelectedBrandName(b.name);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-b border-border/50 last:border-0"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{b.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {/* Overlay to close dropdown when clicking outside */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-md bg-muted/40 border border-border"
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                    className="w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    min="1"
                    required
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1.5 text-muted-foreground text-sm">
                      R
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none text-right"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Total Estimate:</span>{" "}
              <span className="font-bold text-lg text-foreground ml-2">
                R
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                (excl. VAT)
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-border p-6 flex justify-end gap-3 bg-muted/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={loading || !selectedBrand}
            className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
                Processing...
              </>
            ) : (
              "Issue Invoice"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
