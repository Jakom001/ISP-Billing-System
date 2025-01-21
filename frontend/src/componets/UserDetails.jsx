import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../api/userApi';

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user details');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user found</div>;
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">User Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Name:</p>
          <p className="font-semibold">{`${user.firstName} ${user.lastName}`}</p>
        </div>
        <div>
          <p className="text-gray-600">Username:</p>
          <p className="font-semibold">{user.username}</p>
        </div>
        <div>
          <p className="text-gray-600">Email:</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-600">Phone Number:</p>
          <p className="font-semibold">{user.phoneNumber}</p>
        </div>
        <div>
          <p className="text-gray-600">Address:</p>
          <p className="font-semibold">{user.address}</p>
        </div>
        <div>
          <p className="text-gray-600">Package:</p>
          <p className="font-semibold">{user.package ? user.package.packageName : 'Not Set'}</p>
        </div>
        <div>
          <p className="text-gray-600">Connection Type:</p>
          <p className="font-semibold">{user.type}</p>
        </div>
        <div>
          <p className="text-gray-600">Connection Status:</p>
          <p className={`font-semibold ${user.isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {user.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Expiry Date:</p>
          <p className="font-semibold">{new Date(user.connectionExpiryDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Comment:</p>
          <p className="font-semibold">{user.comment || 'No comment'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;