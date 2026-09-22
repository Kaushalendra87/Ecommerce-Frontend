import React from "react";

/**
 * Reusable Loading Spinner Component
 * 
 * @param {Object} props
 * @param {string} [props.message="Loading..."] - Text to show below spinner
 * @param {boolean} [props.fullPage=false] - Whether to center inside a full page container
 * @param {string} [props.size="medium"] - "small" | "medium" | "large"
 */
function LoadingSpinner({ message = "Loading...", fullPage = false, size = "medium" }) {
    const sizeMap = {
        small: { width: "20px", height: "20px", border: "2px" },
        medium: { width: "36px", height: "36px", border: "3px" },
        large: { width: "48px", height: "48px", border: "4px" },
    };

    const currentSize = sizeMap[size] || sizeMap.medium;

    const spinnerContent = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: fullPage ? "4rem 1.5rem" : "1.5rem",
                gap: "0.85rem",
                color: "var(--text-secondary)",
            }}
        >
            <div
                style={{
                    width: currentSize.width,
                    height: currentSize.height,
                    border: `${currentSize.border} solid var(--border-color)`,
                    borderTopColor: "var(--color-sage)",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                }}
            />
            {message && (
                <p
                    style={{
                        margin: 0,
                        fontSize: size === "small" ? "0.85rem" : "0.95rem",
                        fontWeight: "500",
                        color: "var(--text-secondary)",
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );

    if (fullPage) {
        return <div className="page-container">{spinnerContent}</div>;
    }

    return spinnerContent;
}

export default LoadingSpinner;
