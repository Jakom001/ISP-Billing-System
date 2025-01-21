import React, { useState, useMemo, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { usePackageContext } from '../context/PackageContext';
import {useNavigate} from 'react-router-dom'
import { deletePackage } from '../api/packageApi';
import { Link } from 'react-router-dom';

import { 
  Eye as ViewIcon, 
  Edit as EditIcon, 
  Trash2 as DeleteIcon 
} from 'lucide-react';
const PackagesList = () => {
  const navigate = useNavigate();
  const { packages, loading, error, fetchPackages, } = usePackageContext();

  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  
  const [deleted, setDeleted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleEdit = (packageId) => {
    navigate(`/packages/update/${packageId}`);
  };

  const handleDelete = (packageId) => {
    const packageToDelete = packages.find(pkg => pkg._id === packageId);
    setPackageToDelete(packageToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (packageToDelete) {
      try {
        await deletePackage(packageToDelete._id);
        setDeleted(true);
        fetchPackages(); 
        setTimeout(() =>setDeleted(false), 3000)
      } catch (error) {
        console.error("Deletion Error", error)
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
    setPackageToDelete(null);
  };
  // Define columns
  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      
    },
    {
      name: 'Name',
      selector: row => row.packageName,
      sortable: true,
    },
    {
      name: 'Price',
      selector: row => row.price,
      sortable: true,
    },
    {
      name: 'Download Speed',
      selector: row => row.downloadSpeed,
      sortable: true,
    },
    {
      name: 'Upload Speed',
      selector: row => row.uploadSpeed,
      sortable: true,
    },
    {
      name: 'Type',
      selector: row => row.type,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row._id)}
            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"
            title="Edit Package"
          >
            <EditIcon size={20} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            title="Delete Package"

          >
            <DeleteIcon size={20} />
          </button>
        </div>
      ),
      width: '120px',
      center: true,
    },
  ];

  // Filtering logic
  const filteredItems = useMemo(() => {
    if (!Array.isArray(packages)) {
      console.error('Packages is not an array:', packages);
      return [];
    }
    return packages.filter(item => {
      if (!item || typeof item !== 'object') {
        console.error('Invalid package item:', item);
        return false;
      }
      const packageNameMatch = item.packageName && typeof item.packageName === 'string'
        ? item.packageName.toLowerCase().includes(filterText.toLowerCase())
        : false;
      const typeMatch = item.type && typeof item.type === 'string'
        ? item.type.toLowerCase().includes(filterText.toLowerCase())
        : false;
      return packageNameMatch || typeMatch;
    });
  }, [packages, filterText]);

  const FilterComponents = (
    <div className="flex justify-end pr-8 text-blackColor space-x-4 mb-4">
      <button>
      <Link to="/packages/add" className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">Add Package</Link>
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
    <div className="p-4 bg-white text-blackColor shadow-md rounded-lg">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <>
         {deleted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              Package deleted successfully!
            </div>
          )}
          {errors.delete && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {errors.delete}
            </div>
          )}
          <h1 className='p-4 font-bold text-lg'>List of Packages</h1>
          {FilterComponents}
          {Array.isArray(packages) && packages.length > 0 ? (
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
            <p className='p-4'>No packages available.</p>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete the package <b>"{packageToDelete?.packageName}"?</b> </p>
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

export default PackagesList;