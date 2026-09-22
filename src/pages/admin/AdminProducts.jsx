import React, { useEffect, useState } from "react";
import {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
    uploadProductImage,
    getCategories,
} from "../../services/adminApi";

function ProductForm({ onClose, onSave, initial = {}, categories = [] }) {
    const [form, setForm] = useState({
        name: initial.name || initial.title || "",
        description: initial.description || "",
        price: initial.price !== undefined ? initial.price : "",
        stock: initial.stock !== undefined ? initial.stock : "",
        category_id: initial.category?.id || initial.category_id || "",
        featured: initial.featured || false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form, imageFile);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal">
                <div className="admin-modal-header">
                    <h3>{initial.id ? "Edit Product" : "Create New Product"}</h3>
                    <button className="admin-modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            className="form-input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Organic Herbal Tea"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Price (NRs.) *</label>
                            <input
                                className="form-input"
                                type="number"
                                step="0.01"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock Quantity *</label>
                            <input
                                className="form-input"
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-input"
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={form.featured}
                                    onChange={handleChange}
                                />
                                <span>Featured Product</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-input"
                            name="description"
                            rows="3"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Provide product details..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Image</label>
                        <input
                            className="form-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {initial.image && !imageFile && (
                            <div className="image-preview-mini">
                                <span>Current:</span>
                                <img src={initial.image} alt="Current" />
                            </div>
                        )}
                    </div>

                    <div className="admin-modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pRes, cRes] = await Promise.all([
                getProducts({ page_size: 1000 }),
                getCategories({ page_size: 1000 })
            ]);
            setProducts(pRes.data.results ?? pRes.data);
            setCategories(cRes.data.results ?? cRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setEditing(null);
        setShowForm(true);
    };

    const handleEdit = (p) => {
        setEditing(p);
        setShowForm(true);
    };

    const handleDelete = async (p) => {
        const name = p.name || p.title || "product";
        if (!window.confirm(`Delete product "${name}"? This action cannot be undone.`)) return;
        try {
            await deleteProduct(p.id);
            loadData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete product");
        }
    };

    const handleSave = async (formData, imageFile) => {
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                featured: formData.featured,
                category_id: formData.category_id ? parseInt(formData.category_id, 10) : null
            };

            let res;
            if (editing?.id) {
                res = await updateProduct(editing.id, payload);
            } else {
                res = await createProduct(payload);
            }

            const productId = res.data?.id || editing?.id;

            if (imageFile && productId) {
                const fd = new FormData();
                fd.append("image", imageFile);
                await uploadProductImage(productId, fd);
            }

            setShowForm(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data ? JSON.stringify(err.response.data) : "Failed to save product");
        }
    };

    const filteredProducts = products.filter((p) => {
        const name = (p.name || p.title || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    if (loading && products.length === 0) return <div className="admin-loading">Loading products catalog...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Product Management</h2>
                    <p className="admin-subtitle">View, add, edit, and manage products in the store</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Add New Product
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        className="admin-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="admin-count-badge">{filteredProducts.length} items</span>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="admin-empty-state">No products found matching your search.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Featured</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td>#{p.id}</td>
                                        <td>
                                            <div className="admin-table-item">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name || p.title} className="admin-thumb" />
                                                ) : (
                                                    <div className="admin-thumb-placeholder">📷</div>
                                                )}
                                                <div>
                                                    <div className="admin-item-title">{p.name || p.title}</div>
                                                    <div className="admin-item-sub">{p.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.category?.name || "Uncategorized"}</td>
                                        <td className="font-bold">NRs. {parseFloat(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <span className={`badge ${p.stock > 0 ? "badge-success" : "badge-danger"}`}>
                                                {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                        <td>
                                            {p.featured ? (
                                                <span className="badge badge-sage">Featured</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="admin-action-btns">
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEdit(p)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>
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

            {showForm && (
                <ProductForm
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                    initial={editing || {}}
                    categories={categories}
                />
            )}
        </div>
    );
}
