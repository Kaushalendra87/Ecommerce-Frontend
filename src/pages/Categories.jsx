import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getErrorMessage } from "../utils/errorHandler";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend route is /category/
      const response = await axiosInstance.get("/category/");
      setCategories(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load categories. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Categories</h1>
        <LoadingSpinner message="Loading product categories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1 className="page-title">Categories</h1>
        <ErrorMessage message={error} onRetry={fetchCategories} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Categories</h1>
        <EmptyState
          icon="🏷️"
          title="No Categories Available"
          description="There are currently no product categories listed."
          actionText="Browse All Products →"
          actionTo="/products"
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Categories</h1>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="category-card"
          >
            {cat.image ? (
              <img src={cat.image} alt={cat.name} className="category-img" />
            ) : (
              <div className="img-placeholder" style={{ padding: "1.5rem" }}>
                <span>🏷️</span>
              </div>
            )}
            <div className="category-name">{cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Categories;
