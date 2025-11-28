"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { ProductType } from "@/types";

interface Product {
  _id: string;
  name: string;
  type: ProductType;
  priceDkk: number;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  earrings: "Earrings",
  cap: "Cap",
  glooves: "Glooves",
  keyring: "Keyring",
};

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add Product Form
  const [addFormData, setAddFormData] = useState({
    name: "",
    type: "earrings" as ProductType,
    priceDkk: "",
    imageUrl: "",
    description: "",
  });
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Product Form
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "earrings" as ProductType,
    priceDkk: "",
    imageUrl: "",
    description: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    // Validation
    if (!addFormData.name || !addFormData.type || !addFormData.priceDkk || !addFormData.imageUrl || !addFormData.description) {
      setAddError("All fields are required");
      return;
    }

    const price = parseFloat(addFormData.priceDkk);
    if (isNaN(price) || price <= 0) {
      setAddError("Price must be a positive number");
      return;
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addFormData.name,
          type: addFormData.type,
          priceDkk: price,
          imageUrl: addFormData.imageUrl,
          description: addFormData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      showToast("Product created successfully!", "success");
      setShowAddModal(false);
      setAddFormData({ name: "", type: "earrings", priceDkk: "", imageUrl: "", description: "" });
      fetchProducts();
    } catch (error: any) {
      setAddError(error.message || "Failed to create product");
      showToast(error.message || "Failed to create product", "error");
    }
  };

  // Edit Product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editFormData.name || !editFormData.type || !editFormData.priceDkk || !editFormData.imageUrl || !editFormData.description) {
      setEditError("All fields are required");
      return;
    }

    const price = parseFloat(editFormData.priceDkk);
    if (isNaN(price) || price <= 0) {
      setEditError("Price must be a positive number");
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          type: editFormData.type,
          priceDkk: price,
          imageUrl: editFormData.imageUrl,
          description: editFormData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      showToast("Product updated successfully!", "success");
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      setEditError(error.message || "Failed to update product");
      showToast(error.message || "Failed to update product", "error");
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      showToast("Product deleted successfully!", "success");
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      showToast(error.message || "Failed to delete product", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      type: product.type,
      priceDkk: product.priceDkk.toString(),
      imageUrl: product.imageUrl,
      description: product.description,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-brown mb-2">Products</h1>
          <p className="text-brown/70">Add, edit, and manage all store products.</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setAddFormData({ name: "", type: "earrings", priceDkk: "", imageUrl: "", description: "" });
            setAddError(null);
          }}
          className="px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium mt-4 sm:mt-0"
        >
          Add product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-md border border-brown/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-brown/70">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-brown/70">
            {searchTerm ? "No products found matching your search." : "No products found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige border-b border-brown/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-brown">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown/10">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-beige/30 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f5f5dc' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%238B4513' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-brown font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-brown/80">{PRODUCT_TYPE_LABELS[product.type]}</td>
                    <td className="px-6 py-4 text-brown/80 font-semibold">{product.priceDkk} DKK</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-4 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="px-4 py-2 bg-red-500/20 text-red-600 rounded-full hover:bg-red-500/30 transition-colors font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <Modal
          title="Add Product"
          onClose={() => {
            setShowAddModal(false);
            setAddError(null);
          }}
        >
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Product Type</label>
              <select
                value={addFormData.type}
                onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value as ProductType })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              >
                <option value="earrings">Earrings</option>
                <option value="cap">Cap</option>
                <option value="glooves">Glooves</option>
                <option value="keyring">Keyring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Product Name</label>
              <input
                type="text"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Price (DKK)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={addFormData.priceDkk}
                onChange={(e) => setAddFormData({ ...addFormData, priceDkk: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Image URL</label>
              <input
                type="url"
                value={addFormData.imageUrl}
                onChange={(e) => setAddFormData({ ...addFormData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Description</label>
              <textarea
                value={addFormData.description}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                rows={4}
                required
              />
            </div>
            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {addError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
              >
                Create Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <Modal
          title="Edit Product"
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            setEditError(null);
          }}
        >
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Product Type</label>
              <select
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as ProductType })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              >
                <option value="earrings">Earrings</option>
                <option value="cap">Cap</option>
                <option value="glooves">Glooves</option>
                <option value="keyring">Keyring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Product Name</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Price (DKK)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editFormData.priceDkk}
                onChange={(e) => setEditFormData({ ...editFormData, priceDkk: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Image URL</label>
              <input
                type="url"
                value={editFormData.imageUrl}
                onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown"
                rows={4}
                required
              />
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {editError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setEditError(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Product Modal */}
      {showDeleteModal && selectedProduct && (
        <Modal
          title="Delete Product"
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-brown/70">
              Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brown/70 hover:text-brown transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-brown mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}



