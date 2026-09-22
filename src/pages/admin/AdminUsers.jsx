import React, { useEffect, useState } from "react";
import { getUsers, patchUser, activateUser } from "../../services/adminApi";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUsers({ page_size: 500 });
            setUsers(res.data.results ?? res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load user list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const toggleActive = async (u) => {
        const actionText = u.is_active ? "deactivate" : "activate";
        if (!window.confirm(`Are you sure you want to ${actionText} user "${u.username}"?`)) return;
        try {
            await activateUser(u.id, { activate: !u.is_active });
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update user status");
        }
    };

    const toggleStaff = async (u) => {
        const actionText = u.is_staff ? "remove staff privileges from" : "grant staff privileges to";
        if (!window.confirm(`Are you sure you want to ${actionText} "${u.username}"?`)) return;
        try {
            await patchUser(u.id, { is_staff: !u.is_staff });
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update staff status");
        }
    };

    const filteredUsers = users.filter((u) => {
        const query = searchTerm.toLowerCase();
        return (
            (u.username && u.username.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.first_name && u.first_name.toLowerCase().includes(query)) ||
            (u.last_name && u.last_name.toLowerCase().includes(query))
        );
    });

    if (loading && users.length === 0) return <div className="admin-loading">Loading registered accounts...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h2>User Management</h2>
                    <p className="admin-subtitle">View user accounts, staff permissions, and active statuses</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <input
                        type="text"
                        placeholder="Search users by name, username, or email..."
                        className="admin-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="admin-count-badge">{filteredUsers.length} accounts</span>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="admin-empty-state">No user accounts found matching your search.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Full Name</th>
                                    <th>Role</th>
                                    <th>Active</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td>#{u.id}</td>
                                        <td>
                                            <div className="admin-table-item">
                                                {u.profile_picture ? (
                                                    <img src={u.profile_picture} alt={u.username} className="admin-avatar" />
                                                ) : (
                                                    <div className="admin-avatar-placeholder">
                                                        {(u.first_name?.[0] || u.username?.[0] || "U").toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="admin-item-title">{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.first_name || u.last_name
                                                ? `${u.first_name} ${u.last_name}`
                                                : "-"}
                                        </td>
                                        <td>
                                            <div className="admin-role-tags">
                                                {u.is_superuser && <span className="badge badge-purple">Superuser</span>}
                                                {u.is_staff && !u.is_superuser && <span className="badge badge-sage">Staff</span>}
                                                {!u.is_staff && !u.is_superuser && <span className="badge badge-secondary">Customer</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}>
                                                {u.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-action-btns">
                                                <button
                                                    className={`btn btn-sm ${u.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                                    onClick={() => toggleActive(u)}
                                                    disabled={u.is_superuser}
                                                    title={u.is_superuser ? "Cannot deactivate superuser" : ""}
                                                >
                                                    {u.is_active ? "Deactivate" : "Activate"}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => toggleStaff(u)}
                                                    disabled={u.is_superuser}
                                                >
                                                    {u.is_staff ? "Remove Staff" : "Make Staff"}
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
        </div>
    );
}
