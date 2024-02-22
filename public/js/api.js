const API_URL = `https://zacbox.app/api/starmap/`;

class StarMapAPI {
    async get(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`);
        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            mode: 'cors',
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.json();
    }

    async put(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            mode: 'cors',
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.json();
    }

    async delete(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });

        return response.json();
    }
}

export default StarMapAPI;
