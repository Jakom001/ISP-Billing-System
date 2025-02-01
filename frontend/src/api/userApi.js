import apiClient from "../services/apiClient";

export const getUsers = () => apiClient.get("/users/all-users");
export const addUser = (userData) => apiClient.post("/users/add-user", userData);

// Update a user  by id
export const updateUser = (userId, updatedUserData) =>
  apiClient.put(`/users/update-user/${userId}`, updatedUserData);

// Delete a user by id
export const deleteUser = (userId) => apiClient.delete(`/users/delete-user/${userId}`);

// Get a single user by id

export const getUserById = (userId) => apiClient.get(`/users/single-user/${userId}`);

// Change expiry date of a user by id
export const changeExpiryDate = (userId, expiryDate) =>
  apiClient.post(`/users/change-expiry-date/${userId}`, { expiryDate });

