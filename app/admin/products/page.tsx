"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useToast } from "@/contexts/ToastContext";
import { ProductType } from "@/types";
import { validateImageFiles, validateImageFile, MAX_FILE_SIZE, MIN_IMAGES, MAX_IMAGES } from "@/lib/imageUtils";
import { fileToBase64 } from "@/lib/imageUtils";

interface Product {
  _id: string;
  name: string;
  type: ProductType;
  priceDkk: number;
  imageUrl?: string;
  images?: string[];
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
    description: "",
  });
  const [addImages, setAddImages] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Product Form
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "earrings" as ProductType,
    priceDkk: "",
    description: "",
  });
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [existingEditImages, setExistingEditImages] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
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
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products by search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image file selection for Add form
  const handleAddImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = addImages.length + files.length;
    if (totalFiles > MAX_IMAGES) {
      setAddError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setAddError(validation.error || "Invalid image file");
        return;
      }
    }

    setAddImages(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews = await Promise.all(files.map(file => fileToBase64(file)));
    setAddImagePreviews(prev => [...prev, ...newPreviews]);
    setAddError(null);

    // Reset input
    if (addFileInputRef.current) {
      addFileInputRef.current.value = "";
    }
  };

  // Remove image from Add form
  const removeAddImage = (index: number) => {
    setAddImages(prev => prev.filter((_, i) => i !== index));
    setAddImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle image file selection for Edit form
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = editImages.length + existingEditImages.length + files.length;
    if (totalFiles > MAX_IMAGES) {
      setEditError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setEditError(validation.error || "Invalid image file");
        return;
      }
    }

    setEditImages(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews = await Promise.all(files.map(file => fileToBase64(file)));
    setEditImagePreviews(prev => [...prev, ...newPreviews]);
    setEditError(null);

    // Reset input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  // Remove image from Edit form (new uploads)
  const removeEditImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image from Edit form
  const removeExistingEditImage = (index: number) => {
    setExistingEditImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    // Validation
    if (!addFormData.name || !addFormData.type || !addFormData.priceDkk || !addFormData.description) {
      setAddError("All fields are required");
      return;
    }

    const price = parseFloat(addFormData.priceDkk);
    if (isNaN(price) || price <= 0) {
      setAddError("Price must be a positive number");
      return;
    }

    // Validate images
    if (addImages.length < MIN_IMAGES) {
      setAddError(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }

    const validation = validateImageFiles(addImages);
    if (!validation.valid) {
      setAddError(validation.error || "Invalid images");
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("name", addFormData.name);
      formData.append("type", addFormData.type);
      formData.append("priceDkk", price.toString());
      formData.append("description", addFormData.description);
      
      // Append all images
      addImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      showToast("Product created successfully!", "success");
      setShowAddModal(false);
      setAddFormData({ name: "", type: "earrings", priceDkk: "", description: "" });
      setAddImages([]);
      setAddImagePreviews([]);
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

    if (!editFormData.name || !editFormData.type || !editFormData.priceDkk || !editFormData.description) {
      setEditError("All fields are required");
      return;
    }

    const price = parseFloat(editFormData.priceDkk);
    if (isNaN(price) || price <= 0) {
      setEditError("Price must be a positive number");
      return;
    }

    const totalImages = existingEditImages.length + editImages.length;
    if (totalImages < MIN_IMAGES) {
      setEditError(`Please have at least ${MIN_IMAGES} images`);
      return;
    }

    // Validate new images if any
    if (editImages.length > 0) {
      const validation = validateImageFiles(editImages);
      if (!validation.valid) {
        setEditError(validation.error || "Invalid images");
        return;
      }
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("type", editFormData.type);
      formData.append("priceDkk", price.toString());
      formData.append("description", editFormData.description);
      
      // Append existing images that should be kept (as base64 strings)
      existingEditImages.forEach((image) => {
        formData.append("existingImages", image);
      });
      
      // Append new images as files
      editImages.forEach((image) => {
        formData.append("images", image);
      });

      // If no images at all (neither existing nor new), mark to delete
      if (totalImages === 0) {
        formData.append("deleteImages", "true");
      }

      const response = await fetch(`/api/admin/products/${selectedProduct?._id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      showToast("Product updated successfully!", "success");
      setShowEditModal(false);
      setSelectedProduct(null);
      setEditImages([]);
      setEditImagePreviews([]);
      setExistingEditImages([]);
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
      description: product.description,
    });
    
    // Set existing images (from images array or fallback to imageUrl)
    if (product.images && product.images.length > 0) {
      setExistingEditImages(product.images);
    } else if (product.imageUrl) {
      setExistingEditImages([product.imageUrl]);
    } else {
      setExistingEditImages([]);
    }
    
    setEditImages([]);
    setEditImagePreviews([]);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brown mb-2">Products</h1>
          <p className="text-brown/70 text-sm sm:text-base">Add, edit, and manage all store products.</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setAddFormData({ name: "", type: "earrings", priceDkk: "", description: "" });
            setAddImages([]);
            setAddImagePreviews([]);
            setAddError(null);
          }}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base mt-4 sm:mt-0 w-full sm:w-auto"
        >
          Add product
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 sm:py-2.5 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose text-brown text-sm sm:text-base"
        />
      </div>

      {/* Products - Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-2xl shadow-md border border-brown/10 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-brown/70 text-sm sm:text-base">
            {searchTerm ? "No products found matching your search." : "No products found."}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                        <Image
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : product.imageUrl ||
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f5f5dc' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%238B4513' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                          }
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg"
                          unoptimized
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

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-brown/10">
              {filteredProducts.map((product) => (
                <div key={product._id} className="p-4 hover:bg-beige/30 transition-colors">
                  <div className="flex gap-4">
                    <Image
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : product.imageUrl ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f5f5dc' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%238B4513' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={product.name}
                      width={96}
                      height={96}
                      className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 object-cover rounded-lg"
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brown text-sm sm:text-base mb-1 truncate">{product.name}</h3>
                      <p className="text-brown/70 text-xs sm:text-sm mb-1">{PRODUCT_TYPE_LABELS[product.type]}</p>
                      <p className="text-brown font-semibold text-sm sm:text-base mb-3">{product.priceDkk} DKK</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1.5 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-full hover:bg-red-500/30 transition-colors font-medium text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
              <label className="block text-sm font-medium text-brown mb-1">
                Images <span className="text-brown/60">({MIN_IMAGES}-{MAX_IMAGES} images required)</span>
              </label>
              
              {/* Image Upload Area */}
              <div className="space-y-3">
                {/* File Input */}
                {addImages.length < MAX_IMAGES && (
                  <div className="border-2 border-dashed border-brown/20 rounded-lg p-4 hover:border-rose/50 transition-colors">
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddImageChange}
                      className="hidden"
                      id="add-images-input"
                    />
                    <label
                      htmlFor="add-images-input"
                      className="cursor-pointer flex flex-col items-center justify-center text-center"
                    >
                      <svg
                        className="w-8 h-8 text-brown/50 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm text-brown/70">
                        Click to upload images ({addImages.length}/{MAX_IMAGES})
                      </span>
                      <span className="text-xs text-brown/50 mt-1">
                        Max {MAX_FILE_SIZE / (1024 * 1024)}MB per image
                      </span>
                    </label>
                  </div>
                )}

                {/* Image Previews */}
                {(addImagePreviews.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                    {addImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={400}
                          height={256}
                          className="w-full h-32 object-cover rounded-lg border-2 border-brown/20"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeAddImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Count Info */}
                {addImages.length > 0 && (
                  <p className="text-xs text-brown/60">
                    {addImages.length} image(s) selected. {addImages.length < MIN_IMAGES && (
                      <span className="text-red-600">Please add at least {MIN_IMAGES - addImages.length} more image(s).</span>
                    )}
                  </p>
                )}
              </div>
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base"
              >
                Create Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
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
              <label className="block text-sm font-medium text-brown mb-1">
                Images <span className="text-brown/60">({MIN_IMAGES}-{MAX_IMAGES} images required)</span>
              </label>
              
              {/* Image Upload Area */}
              <div className="space-y-3">
                {/* Existing Images */}
                {existingEditImages.length > 0 && (
                  <div>
                    <p className="text-xs text-brown/60 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                      {existingEditImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Existing ${index + 1}`}
                            width={400}
                            height={256}
                            className="w-full h-32 object-cover rounded-lg border-2 border-brown/20"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingEditImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Input */}
                {(existingEditImages.length + editImages.length) < MAX_IMAGES && (
                  <div className="border-2 border-dashed border-brown/20 rounded-lg p-4 hover:border-rose/50 transition-colors">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditImageChange}
                      className="hidden"
                      id="edit-images-input"
                    />
                    <label
                      htmlFor="edit-images-input"
                      className="cursor-pointer flex flex-col items-center justify-center text-center"
                    >
                      <svg
                        className="w-8 h-8 text-brown/50 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm text-brown/70">
                        Click to add more images ({(existingEditImages.length + editImages.length)}/{MAX_IMAGES})
                      </span>
                      <span className="text-xs text-brown/50 mt-1">
                        Max {MAX_FILE_SIZE / (1024 * 1024)}MB per image
                      </span>
                    </label>
                  </div>
                )}

                {/* New Image Previews */}
                {editImagePreviews.length > 0 && (
                  <div>
                    <p className="text-xs text-brown/60 mb-2">New Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                      {editImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={400}
                            height={256}
                            className="w-full h-32 object-cover rounded-lg border-2 border-brown/20"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Count Info */}
                {(existingEditImages.length + editImages.length) > 0 && (
                  <p className="text-xs text-brown/60">
                    {(existingEditImages.length + editImages.length)} image(s) total. {(existingEditImages.length + editImages.length) < MIN_IMAGES && (
                      <span className="text-red-600">Please add at least {MIN_IMAGES - (existingEditImages.length + editImages.length)} more image(s).</span>
                    )}
                  </p>
                )}
              </div>
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-sm sm:text-base"
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
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium text-sm sm:text-base"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-brown/70 hover:text-brown transition-colors z-10"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
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
        <h2 className="text-xl sm:text-2xl font-bold text-brown mb-4 sm:mb-6 pr-8">{title}</h2>
        {children}
      </div>
    </div>
  );
}





