import React, { useState, useEffect, useCallback } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes } from 'react-icons/fa';
import { debounce } from 'lodash';
import { Edit, Eye, Trash2 } from 'lucide-react';

const SessionList = () => {
  const {
    sessions,
    loading,
    error,
    searchSessions,
    deleteSession,
    fetchSessions
  } = useSessionContext();


  // State for the component
  const [displayedSessions, setDisplayedSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim()) {
        setIsSearching(true);
        const result = await searchSessions(term);
        if (result.data) {
          setDisplayedSessions(result.data);
        }
      } else {
        clearSearch();
      }
    }, 300),
    [searchSessions]
  );

  // Handle search input change with immediate search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = async () => {
    setSearchTerm('');
    setIsSearching(false);
    await fetchSessions();
    setCurrentPage(1);
  };

  // Handle sort when header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle delete session
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession(id);
    }
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Update displayed sessions when sessions change or when sorting/pagination changes
  useEffect(() => {
    if (!sessions.length) return;

    let sortedSessions = [...sessions];

    // Apply sorting
    if (sortConfig.key) {
      sortedSessions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setDisplayedSessions(sortedSessions);
  }, [sessions, sortConfig]);

 

    // Get active status badge color - Updated function
  const getActiveBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedSessions.length / itemsPerPage);

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust the start page if we're near the end
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Add first page button if not included
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => paginate(1)}
          className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-1">
            ...
          </span>
        );
      }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 border rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page button if not included
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-1">
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => paginate(totalPages)}
          className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Business Coaching</h2>
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Sessions</h2>
      
      {/* Search form */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
        <a 
          href="/sessions/add" 
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        >
          Add New Session
        </a>
        
        <div className="relative w-full sm:w-auto max-w-md">
          <div className="flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="py-4 px-6 bg-red-50 text-red-600 rounded-md">Error: {error}</div>
      ) : (
        <>
          {/* Sessions table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th 
                    onClick={() => requestSort('name')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <span>{getSortDirectionIcon('name')}</span>
                    </div>
                  </th>
                  
                  <th 
                    onClick={() => requestSort('enterprise')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Enterprise</span>
                      <span>{getSortDirectionIcon('enterprise')}</span>
                    </div>
                  </th>

                  <th 
                    onClick={() => requestSort('rating')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      <span>{getSortDirectionIcon('rating')}</span>
                    </div>
                  </th>

                  <th 
                    onClick={() => requestSort('duration')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Duration</span>
                      <span>{getSortDirectionIcon('duration')}</span>
                    </div>
                  </th>
                  
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((session, index) => (
                    <tr key={session._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{session.name}</td>
    
                      <td className="px-4 py-3 text-sm text-gray-900">{session.enterprise?.name || "No Enterprise"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{session.rating}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{session.duration}</td>
                      
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                            className="text-primary hover:text-green-700 cursor-pointer"

                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                          <a 
                            href={`/sessions/edit/${session._id}`}
                            className="text-secondary rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <Edit className="w-5 h-5" />
                          </a>
                          </button>
                          
                          <button 
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            onClick={() => handleDelete(session._id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                      {isSearching 
                        ? `No sessions found matching "${searchTerm}"`
                        : "No sessions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {displayedSessions.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedSessions.length)} of {displayedSessions.length} entries
              </div>

              {/* Items per page selector */}
              <div className="flex items-center">
                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">Show:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {/* Pagination buttons */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  
                  {generatePaginationButtons()}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionList;