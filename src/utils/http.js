import axios from 'axios'

const http = axios.create({
    //AWS
    //baseURL: 'http://35.174.1.161:8080/api/v1/',

    //VPS
    baseURL: 'http://14.225.253.62:8080/api/v1/',

    //local
    //  baseURL: 'http://localhost:8080/api/v1/',
    timeout: 10000, // 10s
    headers: {
        "Content-Type": "application/json",
    }
})

//gắn token vào header có "Bearer" để xác thực người dùng
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