import React, { useState } from 'react';
import { changeExpiryDate } from '../api/userApi'; // 

const ChangeExpiryModal = ({ isOpen, onClose, userId, onExpiryChange }) => {
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changeExpiryDate(userId, { connectionExpiryDate: expiryDate });
      onExpiryChange(expiryDate);
      console.log(`Expiry date changed to ${expiryDate} for user ${userId}`);
      onClose();
    } catch (error) {
      console.error('Error updating expiry date:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Change Expiry Date</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              New Expiry Date:
            </label>
            <input
              type="datetime-local"
              id="expiryDate"
              name="expiryDate"
              min ={new Date().toISOString().slice(0, 16)}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Change Expiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeExpiryModal;