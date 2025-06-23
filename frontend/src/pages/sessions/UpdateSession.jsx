import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { useEnterpriseContext } from '../../context/EnterpriseContext';
import { toast } from 'react-toastify';
import { Camera, Upload, X, Plus, Star, Edit3 } from 'lucide-react';

const UpdateSession = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateSession, getSingleSession, loading, error, clearError } = useSessionContext();
  const { enterprises } = useEnterpriseContext();

  const [formData, setFormData] = useState({
    name: '',
    objectives: '',
    rating: 0,
    duration: '',
    date: '',
    actionPhotos: [],
    attendanceSheetImage: null,
    workingToolsPhotos: [],
    comment: '',
    outcome: '',
    enterpriseId: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [dragActive, setDragActive] = useState({
    actionPhotos: false,
    attendanceSheet: false,
    workingTools: false
  });
  const [existingFiles, setExistingFiles] = useState({
    actionPhotos: [],
    attendanceSheetImage: null,
    workingToolsPhotos: []
  });

  // Fetch the session data when component mounts
  useEffect(() => {
    const fetchSession = async () => {
      setFetchLoading(true);
      const result = await getSingleSession(id);
      if (result.data) {
        const sessionData = result.data;
        
        // Format date for input field
        const formattedDate = sessionData.date ? 
          new Date(sessionData.date).toISOString().split('T')[0] : '';
        
        setFormData({
          name: sessionData.name || '',
          objectives: sessionData.objectives || '',
          rating: sessionData.rating || 0,
          duration: sessionData.duration || '',
          date: formattedDate,
          actionPhotos: [], // New files to upload
          attendanceSheetImage: null, // New file to upload
          workingToolsPhotos: [], // New files to upload
          comment: sessionData.comment || '',
          outcome: sessionData.outcome || '',
          enterpriseId: sessionData.enterprise?._id || sessionData.enterpriseId || '',
        });

        // Store existing files for display
        setExistingFiles({
          actionPhotos: sessionData.actionPhotos || [],
          attendanceSheetImage: sessionData.attendanceSheetImage || null,
          workingToolsPhotos: sessionData.workingToolsPhotos || []
        });
      } else {
        toast.error('Session not found', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/sessions', { replace: true });
      }
      setFetchLoading(false);
    };

    fetchSession();
  }, [id, getSingleSession, navigate]);

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Session name is required";
    }
    
    if (!formData.enterpriseId) {
      newErrors.enterpriseId = "Enterprise is required";
    }
    
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating (1-5) is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    // Check if attendance sheet exists (either existing or new)
    if (!existingFiles.attendanceSheetImage && !formData.attendanceSheetImage) {
      newErrors.attendanceSheetImage = "Attendance sheet image is required";
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData((prevData) => ({ ...prevData, [name]: processedValue }));

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    
    // Clear global API error
    if (error) clearError();
  };

  const handleRatingClick = (rating) => {
    setFormData((prevData) => ({ ...prevData, rating }));
    if (formErrors.rating) {
      setFormErrors((prevErrors) => ({ ...prevErrors, rating: null }));
    }
  };

  const handleFileUpload = (files, fieldName, multiple = false) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only image files (JPEG, PNG, WebP)', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
}

    // Validate file sizes (5MB limit)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('File size should not exceed 5MB', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (multiple) {
      const existingNewFiles = formData[fieldName] || [];
      const newFiles = [...existingNewFiles, ...fileArray];
      
      if (newFiles.length > 10) {
        toast.error('Maximum 10 files allowed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          });
          return;
        }
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: newFiles
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: fileArray[0]
      }));
    }

    // Clear field error
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }

    toast.success(`${multiple ? 'Files' : 'File'} uploaded successfully`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
  };

  const removeNewFile = (fieldName, index = null) => {
    if (index !== null) {
      // Remove specific file from new files array
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    } else {
      // Remove single new file
      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const removeExistingFile = (fieldName, index = null) => {
    if (index !== null) {
      // Remove specific existing file
      setExistingFiles(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    } else {
      // Remove single existing file
      setExistingFiles(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleDrag = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [fieldName]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = (e, fieldName, multiple = false) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fieldName]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, fieldName, multiple);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors highlighted below", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    
    // Append regular fields
    Object.keys(formData).forEach(key => {
      if (key === 'actionPhotos' || key === 'workingToolsPhotos') {
        // Handle multiple files - only append new files
        formData[key].forEach(file => {
          submitData.append(key, file);
        });
      } else if (key === 'attendanceSheetImage') {
        // Handle single file - only append if new file exists
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      } else {
        submitData.append(key, formData[key] || '');
      }
    });

    // Include information about existing files to keep
    submitData.append('existingActionPhotos', JSON.stringify(existingFiles.actionPhotos));
    submitData.append('existingWorkingToolsPhotos', JSON.stringify(existingFiles.workingToolsPhotos));
    if (existingFiles.attendanceSheetImage) {
      submitData.append('existingAttendanceSheet', existingFiles.attendanceSheetImage);
    }

    const result = await updateSession(id, submitData);

    if (result.data) {
      toast.success(result.success || "Session updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      navigate('/sessions');
    }else if(result.error) {
          toast.error(result.error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        
      };

  const FileUploadArea = ({ fieldName, multiple = false, title, required = false }) => {
    const newFiles = multiple ? (formData[fieldName] || []) : (formData[fieldName] ? [formData[fieldName]] : []);
    const existingFilesList = multiple ? (existingFiles[fieldName] || []) : (existingFiles[fieldName] ? [existingFiles[fieldName]] : []);
    const dragKey = fieldName === 'attendanceSheetImage' ? 'attendanceSheet' : 
                   fieldName === 'actionPhotos' ? 'actionPhotos' : 'workingTools';

    return (
      <div className="mb-6">
        <label className="block text-left text-sm font-medium text-gray-700 mb-2">
          {title}{required && <span className='text-red-500 font-bold'>*</span>}
        </label>

        {/* Existing Files */}
        {existingFilesList.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Existing Files:</p>
            <div className="space-y-2">
              {existingFilesList.map((fileName, index) => (
                <div key={`existing-${index}`} className="flex items-center justify-between bg-blue-50 p-2 rounded border">
                  <span className="text-sm text-blue-700 truncate flex-1">
                    📁 {typeof fileName === 'string' ? fileName.split('/').pop() : `File ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => multiple ? removeExistingFile(fieldName, index) : removeExistingFile(fieldName)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove existing file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive[dragKey] 
              ? 'border-blue-400 bg-blue-50' 
              : formErrors[fieldName]
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={(e) => handleDrag(e, dragKey)}
          onDragLeave={(e) => handleDrag(e, dragKey)}
          onDragOver={(e) => handleDrag(e, dragKey)}
          onDrop={(e) => handleDrop(e, fieldName, multiple)}
        >
          <input
            type="file"
            id={`${fieldName}-update`}
            className="hidden"
            multiple={multiple}
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, fieldName, multiple)}
          />
          
          {newFiles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">New Files to Upload:</p>
              {newFiles.map((file, index) => (
                <div key={`new-${index}`} className="flex items-center justify-between bg-green-50 p-2 rounded border">
                  <span className="text-sm text-green-700 truncate flex-1">
                    📎 {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => multiple ? removeNewFile(fieldName, index) : removeNewFile(fieldName)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove new file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {multiple && (
                <label
                  htmlFor={`${fieldName}-update`}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  <Plus size={16} className="mr-1" />
                  Add More
                </label>
              )}
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-sm text-gray-600">
                <label htmlFor={`${fieldName}-update`} className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload new files
                </label>
                {' '}or drag and drop
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB {multiple && '(max 10 files)'}
              </p>
              {existingFilesList.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Leave empty to keep existing files
                </p>
              )}
            </div>
          )}
        </div>
        
        {formErrors[fieldName] && (
          <div className="text-left text-red-500 text-xs mt-1">
            {formErrors[fieldName]}
          </div>
        )}
      </div>
    );
  };

  const StarRating = () => (
    <div className="mb-6">
      <label className="block text-left text-sm font-medium text-gray-700 mb-2">
        Rating<span className='text-red-500 font-bold'>*</span>
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className={`p-1 rounded transition-colors duration-200 ${
              star <= formData.rating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star 
              size={24} 
              fill={star <= formData.rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 ? `${formData.rating}/5` : 'Select rating'}
        </span>
      </div>
      {formErrors.rating && (
        <div className="text-left text-red-500 text-xs mt-1">
          {formErrors.rating}
        </div>
      )}
    </div>
  );

  if (fetchLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading session data...</p>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl p-4 bg-gray-50 min-h-screen'>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <Edit3 className="h-8 w-8 text-blue-600" />
          <h1 className='text-3xl font-bold text-gray-900'>Update Training Session</h1>
          <p className="text-gray-600">Update your training session details and files</p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 transition-all duration-300">
            {error}
          </div>
        )}
    
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Name */}
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Session Name<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter session name"
              />
              {formErrors.name && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.name}
                </div>
              )}
            </div>

            {/* Enterprise */}
            <div>
              <label className='block text-left text-sm font-medium text-gray-700 mb-2'>
                Enterprise<span className='text-red-500 font-bold'>*</span>
              </label>
              <select 
                name="enterpriseId" 
                value={formData.enterpriseId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  formErrors.enterpriseId ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              >
                <option value="">Select Enterprise</option>
                {enterprises?.map(enterprise => (
                  <option value={enterprise._id} key={enterprise._id}>
                    {enterprise.name}
                  </option>
                ))}
              </select>
              {formErrors.enterpriseId && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.enterpriseId}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Date<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  formErrors.date ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              {formErrors.date && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.date}
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 2.5"
                step="0.5"
                min="0"
              />
            </div>
          </div>

          {/* Rating */}
          <StarRating />

          {/* Objectives */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Objectives
            </label>
            <textarea 
              name="objectives"
              value={formData.objectives}
              onChange={handleChange} 
              rows="3"
              placeholder="Enter session objectives"
              className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
            />
          </div>

          {/* File Upload Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUploadArea 
              fieldName="actionPhotos" 
              multiple={true} 
              title="Action Photos" 
              required={false}
            />
            
            <FileUploadArea 
              fieldName="workingToolsPhotos" 
              multiple={true} 
              title="Working Tools Photos" 
              required={false}
            />
          </div>

          <FileUploadArea 
            fieldName="attendanceSheetImage" 
            multiple={false} 
            title="Attendance Sheet" 
            required={true}
          />

          {/* Comment and Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea 
                name="comment"
                value={formData.comment}
                onChange={handleChange} 
                rows="4"
                placeholder="Enter additional comments"
                className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Outcome
              </label>
              <textarea 
                name="outcome"
                value={formData.outcome}
                onChange={handleChange} 
                rows="4"
                placeholder="Enter session outcome"
                className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            <Link 
              to="/sessions" 
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 text-center"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Session...
                </span>
              ) : (
                "Update Session"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSession;