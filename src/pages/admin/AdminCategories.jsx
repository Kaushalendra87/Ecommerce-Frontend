import React, { useEffect, useState } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
} from "../../services/adminApi";

function CategoryForm({ onClose, onSave, initial = {} }) {
    const [form, setForm] = useState({
        name: initial.name || "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

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
                    <h3>{initial.id ? "Edit Category" : "Create Category"}</h3>
                    <button className="admin-modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Category Name *</label>
                        <input
                            className="form-input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Beverages, Skincare"
                        />
                    </div>
                    <div className="form-group">
                        <label>Category Image</label>
                        <input
                            className="form-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {initial.image && !imageFile && (
                            <div className="image-preview-mini">
                                <span>Current:</span>
                                <img src={initial.image} alt={initial.name} />
                            </div>
                        )}
                    </div>
                    <div className="admin-modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getCategories({ page_size: 1000 });
            setCategories(res.data.results ?? res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = () => {
        setEditing(null);
        setShowForm(true);
    };

    const handleEdit = (c) => {
        setEditing(c);
        setShowForm(true);
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete category "${c.name}"? This action cannot be undone.`)) return;
        try {
            await deleteCategory(c.id);
            loadCategories();
        } catch (err) {
            console.error(err);
            alert("Failed to delete category");
        }
    };

    const handleSave = async (formData, imageFile) => {
        try {
            let res;
            if (editing?.id) {
                res = await updateCategory(editing.id, { name: formData.name });
            } else {
                res = await createCategory({ name: formData.name });
            }

            const id = res.data?.id || editing?.id;
            if (imageFile && id) {
                const fd = new FormData();
                fd.append("image", imageFile);
                await uploadCategoryImage(id, fd);
            }

            setShowForm(false);
            loadCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data ? JSON.stringify(err.response.data) : "Failed to save category");
        }
    };

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && categories.length === 0) return <div className="admin-loading">Loading categories...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>Category Management</h2>
                    <p className="admin-subtitle">Organize and manage store categories</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Add New Category
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <input
                        type="text"
                        placeholder="Search categories by name..."
                        className="admin-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="admin-count-badge">{filtered.length} categories</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="admin-empty-state">No categories found matching your query.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Slug</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td>#{c.id}</td>
                                        <td>
                                            <div className="admin-table-item">
                                                {c.image ? (
                                                    <img src={c.image} alt={c.name} className="admin-thumb" />
                                                ) : (
                                                    <div className="admin-thumb-placeholder">📁</div>
                                                )}
                                                <span className="admin-item-title">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="admin-item-sub">{c.slug}</td>
                                        <td>
                                            <div className="admin-action-btns">
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEdit(c)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>
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
                <CategoryForm
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                    initial={editing || {}}
                />
            )}
        </div>
    );
}
