import React, { useState } from 'react';
import ChangeExpiryModal from './ChangeExpiryModal';

const ChangeExpiry = ({ userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExpiryChange = (newExpiryDate) => {
    // Handle the expiry date change (e.g., update local state, refresh data)
    console.log(`Expiry date changed to ${newExpiryDate} for user ${userId}`);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Change Expiry Date
      </button>

      <ChangeExpiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onExpiryChange={handleExpiryChange}
      />
    </div>
  );
};

export default ChangeExpiry;