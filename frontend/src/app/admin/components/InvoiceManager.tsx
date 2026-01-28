import { useState } from "react";
import InvoiceList from "./invoices/InvoiceList";
import CreateInvoiceModal from "./invoices/CreateInvoiceModal";
import { useSession } from "next-auth/react";

export default function InvoiceManager() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Note: session.accessToken might be needed if axios interceptor isn't setting it globally
  // Assuming session object has accessToken for now.
  // If not, we might need a custom hook or assume global setup.
  // Based on other files, session seems to be used.
  const token = (session as any)?.accessToken || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage ad-hoc billing and track payments.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Create Invoice
        </button>
      </div>

      <InvoiceList token={token} refreshTrigger={refreshTrigger} />

      {isCreateModalOpen && (
        <CreateInvoiceModal
          token={token}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
