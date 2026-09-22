/**
 * Safely extracts a user-friendly error message from an Axios error object or standard JS error.
 * 
 * @param {any} error - The error object caught in try/catch
 * @param {string} fallbackMessage - Default message if no specific detail is found
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, fallbackMessage = "An unexpected error occurred. Please try again.") {
    if (!error) return fallbackMessage;

    // Handle Axios response errors
    if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
            return data;
        }

        if (data.detail && typeof data.detail === "string") {
            return data.detail;
        }

        if (data.error && typeof data.error === "string") {
            return data.error;
        }

        if (data.message && typeof data.message === "string") {
            return data.message;
        }

        if (Array.isArray(data.non_field_errors)) {
            return data.non_field_errors.join(" ");
        }

        // Object containing field errors e.g. { username: ["This field is required."] }
        if (typeof data === "object") {
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey])) {
                return `${firstKey}: ${data[firstKey].join(" ")}`;
            } else if (firstKey && typeof data[firstKey] === "string") {
                return `${firstKey}: ${data[firstKey]}`;
            }
        }
    }

    // Handle network errors or timeout
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        return "Unable to connect to the server. Please check your internet connection or backend server.";
    }

    if (error.message) {
        return error.message;
    }

    return fallbackMessage;
}
