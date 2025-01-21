import React, { useState, useMemo, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { usePaymentContext } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import { deletePayment } from '../api/paymentApi';
import { Link } from 'react-router-dom';

import { 
  Eye as ViewIcon, 
  Edit as EditIcon, 
  Trash2 as DeleteIcon 
} from 'lucide-react';

const PaymentsList = () => {
  const navigate = useNavigate();
  const { payments, loading, error, fetchPayments } = usePaymentContext();

  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  // console.log(payments)

  const handleEdit = (paymentId) => {
    navigate(`/payments/update/${paymentId}`);
  };

  const handleDelete = (paymentId) => {
    const paymentToDelete = payments.find(payment => payment._id === paymentId);
    setPaymentToDelete(paymentToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        await deletePayment(paymentToDelete._id);
        setDeleted(true);
        fetchPayments();
        setTimeout(() => setDeleted(false), 3000);
      } catch (error) {
        console.error("Deletion Error", error);
        const backendError =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Failed to delete the item. Please try again.";

        // Update the errors state with the backend error
        setErrors((prev) => ({
          ...prev,
          delete: backendError,
        }));
      }
    }
    setIsDeleteModalOpen(false);
    setPaymentToDelete(null);
  };

  // Define columns
  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
    },
    {
      name: 'User',
      selector: row => row.user.username,
      sortable: true,
    },
    {
      name: 'Phone Number',
      selector: row => row.user.phoneNumber,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.amount,
      sortable: true,
    },
    {
      name: 'Receipt',
      selector: row => row.receiptNumber,
      sortable: true,
    },
    {
      name: 'Payment Method',
      selector: row => row.paymentMethod,
      sortable: true,
    },
    {
      name: 'Payment Date',
      selector: row => new Date(row.paymentDate).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      sortable: true,
    },
    {
      name: 'Checked',
      selector: row => row.checked,
      sortable: true,
      cell: row => (
        <span className={`px-2 py-1 rounded ${
          row.checked === "yes"
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.checked}
        </span>
      )
    },
    
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          {/* <button 
            onClick={() => handleView(row._id)}
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
            title="View Payment"
          >
            <ViewIcon size={20} />
          </button> */}

          <button 
            onClick={() => handleEdit(row._id)}
            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"
            title="Edit Payment"
          >
            <EditIcon size={20} />
          </button>

          <button 
            onClick={() => handleDelete(row._id)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            title="Delete Payment"
          >
            <DeleteIcon size={20} />
          </button>
        </div>
      ),
      width: '120px',
      center: true,
    }
  ];

  // Filtering logic
  const filteredItems = useMemo(() => {
    if (!Array.isArray(payments)) {
      console.error('Payments is not an array:', payments);
      return [];
    }
    return payments.filter(item => {
      if (!item || typeof item !== 'object') {
        console.error('Invalid payment item:', item);
        return false;
      }
      const usernameMatch = item.user && item.user.username && typeof item.user.username === 'string'
        ? item.user.username.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const phoneNumberMatch = item.user && item.user.phoneNumber && typeof item.user.phoneNumber === 'string'
        ? item.user.phoneNumber.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const amountMatch = item.amount && typeof item.amount === 'number'
        ? item.amount.toString().includes(filterText)
        : false;
      const receiptNumberMatch = item.receiptNumber && typeof item.receiptNumber === 'string'
        ? item.receiptNumber.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const paymentMethodMatch = item.paymentMethod && typeof item.paymentMethod === 'string'
        ? item.paymentMethod.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const paymentDateMatch = item.paymentDate && typeof item.paymentDate === 'string'
        ? item.paymentDate.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const checkedMatch = item.checked && typeof item.checked === 'string'
        ? item.checked.toLowerCase().includes(filterText.toLowerCase())
        : false;

      return usernameMatch || phoneNumberMatch || amountMatch || receiptNumberMatch || paymentMethodMatch || paymentDateMatch || checkedMatch;
    });
  }, [payments, filterText]);


  const FilterComponents = (
    <div className="flex justify-end pr-8 text-blackColor space-x-4 mb-4">
      <button>
      <Link to="/payments/add" className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">Add Payment</Link>
    </button>
      <input
        type="text"
        placeholder="Search..."
        className="px-3 py-2 border rounded w-full max-w-xs"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
    </div>
  );

  // Custom styles for the data table
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    headCells: {
      style: {
        fontWeight: 'bold',
        color: '#374151',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
        '&:nth-child(even)': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    pagination: {
      style: {
        marginTop: '8px',
        borderTop: '1px solid #e5e7eb',
      },
    },
  };

  return (
    <div className=" bg-white text-blackColor shadow-md rounded-lg">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <>
          {deleted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              Payment deleted successfully!
            </div>
          )}
          {errors.delete && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {errors.delete}
            </div>
          )}
          <h1 className='p-4 font-bold text-lg'>List of Payments</h1>
          {FilterComponents}
          {Array.isArray(payments) && payments.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredItems}
              pagination
              paginationResetDefaultPage={resetPaginationToggle}
              customStyles={customStyles}
              highlightOnHover
              striped
            />
          ) : (
            <p className='p-4'>No payments available.</p>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete the payment <b>"{paymentToDelete?.user.username}"</b>?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;