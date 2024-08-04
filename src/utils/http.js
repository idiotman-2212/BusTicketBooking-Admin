import axios from 'axios'

const http = axios.create({
    //AWS
    //baseURL: 'http://35.174.1.161:8080/api/v1/',

    //VPS
    baseURL: 'http://localhost:8080/api/v1/',

    //local
    //  baseURL: 'http://localhost:8080/api/v1/',
    timeout: 10000, // 10s
    headers: {
        "Content-Type": "application/json",
    }
})

http.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('acToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
})

export { http }