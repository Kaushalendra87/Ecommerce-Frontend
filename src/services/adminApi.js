import axiosInstance from "./axios";

// Products
export const getProducts = (params = {}) => axiosInstance.get(`/api/admin/products/`, { params });
export const createProduct = (data) => axiosInstance.post(`/api/admin/products/create/`, data);
export const getProduct = (id) => axiosInstance.get(`/api/admin/products/${id}/`);
export const updateProduct = (id, data) => axiosInstance.put(`/api/admin/products/${id}/`, data);
export const patchProduct = (id, data) => axiosInstance.patch(`/api/admin/products/${id}/`, data);
export const deleteProduct = (id) => axiosInstance.delete(`/api/admin/products/${id}/`);
export const uploadProductImage = (id, formData) =>
    axiosInstance.post(`/api/admin/products/${id}/upload-image/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// Categories
export const getCategories = (params = {}) => axiosInstance.get(`/api/admin/categories/`, { params });
export const createCategory = (data) => axiosInstance.post(`/api/admin/categories/create/`, data);
export const getCategory = (id) => axiosInstance.get(`/api/admin/categories/${id}/`);
export const updateCategory = (id, data) => axiosInstance.put(`/api/admin/categories/${id}/`, data);
export const patchCategory = (id, data) => axiosInstance.patch(`/api/admin/categories/${id}/`, data);
export const deleteCategory = (id) => axiosInstance.delete(`/api/admin/categories/${id}/`);
export const uploadCategoryImage = (id, formData) =>
    axiosInstance.post(`/api/admin/categories/${id}/upload-image/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// Orders
export const getOrders = (params = {}) => axiosInstance.get(`/api/admin/orders/`, { params });
export const getOrder = (id) => axiosInstance.get(`/api/admin/orders/${id}/`);
export const updateOrderStatus = (id, data) =>
    axiosInstance.patch(`/api/admin/orders/${id}/update-status/`, data);

// Users
export const getUsers = (params = {}) => axiosInstance.get(`/api/admin/users/`, { params });
export const getUser = (id) => axiosInstance.get(`/api/admin/users/${id}/`);
export const patchUser = (id, data) => axiosInstance.patch(`/api/admin/users/${id}/`, data);
export const activateUser = (id, data = {}) => axiosInstance.post(`/api/admin/users/${id}/activate/`, data);

// Reviews
export const getReviews = (params = {}) => axiosInstance.get(`/api/admin/reviews/`, { params });
export const getReview = (id) => axiosInstance.get(`/api/admin/reviews/${id}/`);
export const deleteReview = (id) => axiosInstance.delete(`/api/admin/reviews/${id}/`);
