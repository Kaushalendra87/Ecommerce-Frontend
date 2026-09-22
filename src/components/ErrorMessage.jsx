import React from "react";

/**
 * Reusable Error Message Banner Component
 * 
 * @param {Object} props
 * @param {string} props.message - Error message string
 * @param {Function} [props.onRetry] - Optional callback function to retry the failed request
 * @param {boolean} [props.fullPage=false] - Whether to render wrapped in .page-container
 */
function ErrorMessage({ message, onRetry, fullPage = false }) {
    if (!message) return null;

    const content = (
        <div
            className="alert alert-danger"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginTop: "1rem",
                marginBottom: "1rem",
            }}
            role="alert"
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 auto" }}>
                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                <span>{message}</span>
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        padding: "0.4rem 0.85rem",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--danger)",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--danger-border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                    }}
                >
                    🔄 Try Again
                </button>
            )}
        </div>
    );

    if (fullPage) {
        return <div className="page-container">{content}</div>;
    }

    return content;
}

export default ErrorMessage;
