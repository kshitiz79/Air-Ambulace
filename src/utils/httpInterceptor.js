export const setupHttpInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        let retries = 3;
        const requestMethod = (args[1] && args[1].method) ? args[1].method.toUpperCase() : 'GET';

        while (retries > 0) {
            try {
                const response = await originalFetch(...args);

                // If the token is expired or invalid, backend returns 401 or 403
                if (response.status === 401 || response.status === 403) {
                    // Clear the session details securely
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('role');

                    // Redirect user to login page safely
                    if (window.location.pathname !== '/sign-in' && window.location.pathname !== '/') {
                        window.location.href = '/sign-in?expired=true';
                    }
                    return response; // No need to retry authentication errors
                }

                // Retry only on 5XX Server Errors and only for GET requests
                if (response.status >= 500 && retries > 1 && requestMethod === 'GET') {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
                    continue;
                }

                return response;
            } catch (error) {
                // Network failures or other exceptions can be retried on GET requests
                if (retries > 1 && requestMethod === 'GET') {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('API call failed in interceptor after retries:', error);
                throw error;
            }
        }
    };
};
