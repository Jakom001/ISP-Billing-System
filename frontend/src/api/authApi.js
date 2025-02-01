import apiClient from "../services/apiClient";

export const loginUser = (loginData) => apiClient.post('/auths/login', loginData);
export const registerUser = (registerData) => apiClient.post('/auths/register', registerData);
export const fetchCurrentUser = () => apiClient.get('/auths/current-user');

export const logout =async() =>{
    try {
        const {data} = await apiClient.post('/auths/logout');
        return data;
    } catch (error) {
        console.log("Logout Error", error);
        throw error;
    }
}
