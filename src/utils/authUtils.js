// Decode JWT safely and check if expired
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const payload = JSON.parse(decodedJson);

        // Convert to milliseconds and compare with current time
        // Adding a 5 second buffer to prevent race conditions
        const isExpired = Date.now() >= (payload.exp * 1000) - 5000;

        return isExpired;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return true; // Consider invalid tokens as expired
    }
};
