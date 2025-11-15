import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "https://unah-pomodoro-api.azurewebsites.net",
    //baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
    timeout: 5000,
});

export default api;
