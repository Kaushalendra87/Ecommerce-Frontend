import React from "react";
import { Link } from "react-router-dom";

/**
 * Reusable Empty State Display Component
 * 
 * @param {Object} props
 * @param {string} [props.icon="📦"] - Emoji or icon
 * @param {string} props.title - Main heading title
 * @param {string} [props.description] - Supporting descriptive text
 * @param {string} [props.actionText] - Button/link label
 * @param {string} [props.actionTo] - Target URL path for Link
 * @param {Function} [props.onAction] - Alternative click handler if actionTo is not provided
 */
function EmptyState({
    icon = "📦",
    title,
    description,
    actionText,
    actionTo,
    onAction,
}) {
    return (
        <div className="empty-state" style={{ marginTop: "1.5rem" }}>
            {icon && <span className="empty-state-icon">{icon}</span>}
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}

            {actionText && actionTo && (
                <Link to={actionTo} className="btn-browse">
                    {actionText}
                </Link>
            )}

            {actionText && !actionTo && onAction && (
                <button onClick={onAction} className="btn-browse" style={{ cursor: "pointer" }}>
                    {actionText}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
