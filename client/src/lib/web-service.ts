export const WebService = {
    BASE_URL: 'https://thebackchairapp.com/app/action.php',

    async post(action: string, body: Record<string, any>, accessToken: string | null = null) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (accessToken) {
                headers['ACCESSTOKEN'] = accessToken;
            }

            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({ action, ...body }),
            });

            const rawResponse = await response.text();
            console.log('Raw server response:', rawResponse);

            if (rawResponse) {
                const data = JSON.parse(rawResponse);
                if (data.serverResponse && data.serverResponse.code !== 200) {
                    console.warn('API Warning:', data.serverResponse.message);
                }
                return data;
            } else {
                throw new Error('Empty response from server');
            }
        } catch (error) {
            console.error('Error in WebService.post:', error.message);
            return { serverResponse: { code: 500, message: (error as Error).message } };
        }
    },

    // Validation helper
    validateEmailOrPhone(value: string): { isValid: boolean; type: 'email' | 'phone' | null } {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[\d\s-]{10,}$/;

        if (emailRegex.test(value)) {
            return { isValid: true, type: 'email' };
        } else if (phoneRegex.test(value)) {
            return { isValid: true, type: 'phone' };
        }

        return { isValid: false, type: null };
    }
};