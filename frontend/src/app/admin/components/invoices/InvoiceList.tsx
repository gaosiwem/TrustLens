import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  brand: {
    name: string;
    manager: { email: string } | null;
  };
  total: number;
  status: string;
  issuedAt: string;
  dueDate: string | null;
  paidAt: string | null;
}

interface InvoiceListProps {
  token: string;
  refreshTrigger: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    VOID: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ISSUED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.ISSUED}`}
    >
      {status}
    </span>
  );
};

export default function InvoiceList({
  token,
  refreshTrigger,
}: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/billing/admin/invoices`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setInvoices(response.data);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token, refreshTrigger]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this invoice as ${newStatus}?`))
      return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/admin/invoices/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Optimistic update
      setInvoices(
        invoices.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                status: newStatus,
                paidAt:
                  newStatus === "PAID" ? new Date().toISOString() : inv.paidAt,
              }
            : inv,
        ),
      );
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-card text-center">
        <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">
          receipt_long
        </span>
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Create functionality to issue your first invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Invoice #
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Brand
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-right">
                Amount
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Issued/Due
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-4 font-medium">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{invoice.brand.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.brand.manager?.email || "No email"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-right">
                  R{(invoice.total / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div>{format(new Date(invoice.issuedAt), "dd MMM yyyy")}</div>
                  {invoice.dueDate && (
                    <div className="text-xs text-muted-foreground">
                      Due: {format(new Date(invoice.dueDate), "dd MMM")}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      title="Preview PDF"
                      onClick={async () => {
                        try {
                          const res = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_URL}/billing/admin/invoices/${invoice.id}/preview`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: "blob",
                            },
                          );
                          const url = window.URL.createObjectURL(
                            new Blob([res.data], { type: "application/pdf" }),
                          );
                          window.open(url, "_blank");
                        } catch (e) {
                          toast.error("Failed to preview invoice");
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                    <button
                      title="Resend Email"
                      onClick={async () => {
                        if (!confirm("Resend invoice email to brand manager?"))
                          return;
                        try {
                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/billing/admin/invoices/${invoice.id}/send`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } },
                          );
                          toast.success("Invoice resent successfully");
                        } catch (e) {
                          toast.error("Failed to resend invoice");
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        send
                      </span>
                    </button>

                    {invoice.status === "ISSUED" && (
                      <>
                        <div className="w-px h-4 bg-border my-auto mx-1"></div>
                        <button
                          onClick={() => handleStatusChange(invoice.id, "PAID")}
                          className="text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleStatusChange(invoice.id, "VOID")}
                          className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                        >
                          Void
                        </button>
                      </>
                    )}
                  </div>
                  {invoice.status === "PAID" && invoice.paidAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Pd: {format(new Date(invoice.paidAt), "dd MMM")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
