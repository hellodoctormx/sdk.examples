import auth from '@react-native-firebase/auth';
import {API_HOST} from '../../app.config.js';

export default class ExampleAppHTTPClient {
    async get(path: string) {
        return this.doRequest(path, 'GET');
    }

    async post(path: string, data?: Record<string, any>) {
        return this.doRequest(path, 'POST', data);
    }

    async put(path: string, data?: Record<string, any>) {
        return this.doRequest(path, 'PUT', data);
    }

    async delete(path: string) {
        return this.doRequest(path, 'DELETE');
    }

    async doRequest(path: string, method: string, data?: Record<string, any>) {
        const url = `${API_HOST}${path}`;

        const requestHeaders = await this.getRequestHeaders();

        const response = await fetch(url, {
            method,
            body: JSON.stringify(data),
            headers: requestHeaders,
        });

        return nullSafeJsonResponse(response);
    }

    async getRequestHeaders() {
        const {currentUser} = auth();

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (currentUser !== undefined) {
            requestHeaders.Authorization = `Bearer ${await currentUser.getIdToken()}`;
            requestHeaders['X-User-UID'] = currentUser.uid;
        }

        return requestHeaders;
    }

}

export function nullSafeJsonResponse(response: Response) {
    if (response.status < 200 || response.status >= 300) {
        console.warn(`[Http.nullSafeJsonResponse:BAD_STATUS:${response.status}]`, response);
        throw new Error(response.statusText);
    }

    return response.json();
}
