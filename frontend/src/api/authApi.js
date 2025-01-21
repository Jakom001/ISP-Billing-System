import apiClient from "../services/apiClient";

export const loginUser = (loginData) => apiClient.post('/auths/login', loginData);
export const registerUser = (registerData) => apiClient.post('/auths/register', registerData);
