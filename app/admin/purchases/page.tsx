"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";

interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  productType: "earrings" | "cap" | "glooves" | "keyring";
  price: number;
  verificationStatus: "pending" | "received" | "not_received";
  createdAt: string;
  updatedAt: string;
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  earrings: "Earrings",
  cap: "Cap",
  glooves: "Glooves",
  keyring: "Keyring",
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "Pending Verification", color: "bg-yellow-100 text-yellow-700" },
  received: { text: "Payment Received", color: "bg-green-100 text-green-700" },
  not_received: { text: "Payment Not Received", color: "bg-red-100 text-red-700" },
};

export default function AdminPurchasesPage() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/purchases");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch purchases");
      }

      setPurchases(data.purchases || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load purchases", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleStatusUpdate = async (purchaseId: string, newStatus: "pending" | "received" | "not_received") => {
    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update purchase");
      }

      showToast("Purchase status updated successfully!", "success");
      fetchPurchases();
    } catch (error: any) {
      showToast(error.message || "Failed to update purchase", "error");
    }
  };

  // Filter purchases by search term
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brown mb-2">Purchases & Orders</h1>
          <p className="text-brown/70 text-sm sm:text-base">Manage and verify customer purchases.</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search by product, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 sm:py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown text-sm sm:text-base"
        />
      </div>

      {/* Purchases - Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-2xl shadow-md border border-brown/10 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">Loading purchases...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">
            {searchTerm ? "No purchases found matching your search." : "No purchases found."}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-beige border-b border-brown/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brown">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown/10">
                  {filteredPurchases.map((purchase) => {
                    const status = STATUS_LABELS[purchase.verificationStatus] || STATUS_LABELS.pending;
                    return (
                      <tr key={purchase.id} className="hover:bg-beige/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-brown font-medium">{purchase.userName}</p>
                            <p className="text-brown/60 text-xs">{purchase.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-brown font-medium">{purchase.productName}</td>
                        <td className="px-6 py-4 text-brown/80">
                          {PRODUCT_TYPE_LABELS[purchase.productType] || purchase.productType}
                        </td>
                        <td className="px-6 py-4 text-brown/80 font-semibold">{purchase.price} DKK</td>
                        <td className="px-6 py-4 text-brown/70 text-sm">{formatDate(purchase.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {purchase.verificationStatus !== "received" && (
                              <button
                                onClick={() => handleStatusUpdate(purchase.id, "received")}
                                className="px-4 py-2 bg-green-500/20 text-green-700 rounded-full hover:bg-green-500/30 transition-colors font-medium text-sm"
                              >
                                Mark Received
                              </button>
                            )}
                            {purchase.verificationStatus !== "not_received" && (
                              <button
                                onClick={() => handleStatusUpdate(purchase.id, "not_received")}
                                className="px-4 py-2 bg-red-500/20 text-red-600 rounded-full hover:bg-red-500/30 transition-colors font-medium text-sm"
                              >
                                Mark Not Received
                              </button>
                            )}
                            {purchase.verificationStatus !== "pending" && (
                              <button
                                onClick={() => handleStatusUpdate(purchase.id, "pending")}
                                className="px-4 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm"
                              >
                                Reset to Pending
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-brown/10">
              {filteredPurchases.map((purchase) => {
                const status = STATUS_LABELS[purchase.verificationStatus] || STATUS_LABELS.pending;
                return (
                  <div key={purchase.id} className="p-4 hover:bg-beige/30 transition-colors">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-brown text-sm sm:text-base mb-1">{purchase.productName}</h3>
                        <p className="text-brown/70 text-xs sm:text-sm break-all">{purchase.userName} ({purchase.userEmail})</p>
                        <p className="text-brown/60 text-xs mt-1">{formatDate(purchase.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-brown/70 mb-2">
                        <span>{PRODUCT_TYPE_LABELS[purchase.productType] || purchase.productType}</span>
                        <span className="font-semibold text-brown">{purchase.price} DKK</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {purchase.verificationStatus !== "received" && (
                          <button
                            onClick={() => handleStatusUpdate(purchase.id, "received")}
                            className="px-3 py-1.5 bg-green-500/20 text-green-700 rounded-full hover:bg-green-500/30 transition-colors font-medium text-xs sm:text-sm flex-1 min-w-[120px]"
                          >
                            Mark Received
                          </button>
                        )}
                        {purchase.verificationStatus !== "not_received" && (
                          <button
                            onClick={() => handleStatusUpdate(purchase.id, "not_received")}
                            className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-full hover:bg-red-500/30 transition-colors font-medium text-xs sm:text-sm flex-1 min-w-[120px]"
                          >
                            Mark Not Received
                          </button>
                        )}
                        {purchase.verificationStatus !== "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(purchase.id, "pending")}
                            className="px-3 py-1.5 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-xs sm:text-sm flex-1 min-w-[100px]"
                          >
                            Reset to Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
