import api from '../api/api';

import jwt_decode from 'jwt-decode';

export const isTokenExpired = (token) => {
    if (!token) return true; // If no token, treat it as expired

    try{
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decoded.exp < currentTime; 
    }
    catch (error) {
        console.error("Error decoding token:", error);
        return true; // If there's an error decoding, treat it as expired
    }
}

export const refreshToken = async (refreshToken) => {
    try {
        const response = await api.post('/auth/refresh-token', { refreshToken });
        const {token} = response.data;

        localStorage.setItem('token', token); 
        return token;
    } catch (error) {
        localStorage.removeItem('token', token);
        window.location.href = '/login';
        return null;
    }
}
