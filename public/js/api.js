class StarMapAPI {
    async get(endpoint) {
        const response = await fetch(`/${endpoint}`);

        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`/${endpoint}`, {
            method: 'POST',
            body: data,
            header: {
            }
        });

        return response.json();
    }

    async put(endpoint, data) {
        const response = await fetch(`/${endpoint}`, {
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.json();
    }

    async delete(endpoint) {
        const response = await fetch(`/${endpoint}`, {
            method: 'DELETE'
        });

        return response.json();
    }
}

export default StarMapAPI;