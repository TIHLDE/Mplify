const BASE_URL = (window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/';

export default function apiRequest(resourceUrl = '', method = 'GET', payload = null, customHeaders = null) {
    const url = BASE_URL + resourceUrl;
    const headers = !customHeaders ? {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': sessionStorage.getItem('token')
    } : customHeaders;
    const body = !!payload ? (!customHeaders ? JSON.stringify(payload) : payload) : null;

    const options = {
        method: method,
        headers: headers,
        body: body
    };


    return fetch(url, options);
}