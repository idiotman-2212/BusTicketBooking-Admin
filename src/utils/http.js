import axios from 'axios'

const http = axios.create({
    //local
    baseURL: 'http://admin.chauhuydien.id.vn/api/v1/',

    //baseURL: 'http://localhost:8080/api/v1/',
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