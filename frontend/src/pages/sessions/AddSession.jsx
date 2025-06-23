import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { useEnterpriseContext } from '../../context/EnterpriseContext';
import { toast } from 'react-toastify';
import { Camera, Upload, X, Plus, Star } from 'lucide-react';

const AddSession = () => {
  const navigate = useNavigate();
  const { addSession, loading, error, clearError } = useSessionContext();
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
  const [dragActive, setDragActive] = useState({
    actionPhotos: false,
    attendanceSheet: false,
    workingTools: false
  });

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
    
    // if (!formData.attendanceSheetImage) {
    //   newErrors.attendanceSheetImage = "Attendance sheet image is required";
    // }
    
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (multiple) {
      const existingFiles = formData[fieldName] || [];
      const newFiles = [...existingFiles, ...fileArray];
      
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

  const removeFile = (fieldName, index = null) => {
    if (index !== null) {
      // Remove specific file from array
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    } else {
      // Remove single file
      setFormData(prev => ({
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
        autoClose: 4000,
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
        // Handle multiple files
        formData[key].forEach(file => {
          submitData.append(key, file);
        });
      } else if (key === 'attendanceSheetImage') {
        // Handle single file
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      } else {
        submitData.append(key, formData[key]);
      }
    });

    const result = await addSession(submitData);

    if (result.data) {
      toast.success(result.success || "Session added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      //Reset form
      setFormData({
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
      })

      
      setTimeout(() => {
              navigate('/sessions');
            }, 2000);
    } else if(result.error) {
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
    const files = multiple ? (formData[fieldName] || []) : (formData[fieldName] ? [formData[fieldName]] : []);
    const dragKey = fieldName === 'attendanceSheetImage' ? 'attendanceSheet' : 
                   fieldName === 'actionPhotos' ? 'actionPhotos' : 'workingTools';

    return (
      <div className="mb-6">
        <label className="block text-left text-sm font-medium text-gray-700 mb-2">
          {title}{required && <span className='text-red-500 font-bold'>*</span>}
        </label>
        
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
            id={fieldName}
            className="hidden"
            multiple={multiple}
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, fieldName, multiple)}
          />
          
          {files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => multiple ? removeFile(fieldName, index) : removeFile(fieldName)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {multiple && (
                <label
                  htmlFor={fieldName}
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
                <label htmlFor={fieldName} className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </label>
                {' '}or drag and drop
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB {multiple && '(max 10 files)'}
              </p>
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

  return (
    <div className='mx-auto max-w-4xl p-4 bg-gray-50 min-h-screen'>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <Camera className="h-8 w-8 text-blue-600" />
          <h1 className='text-3xl font-bold text-gray-900'>Add Training Session</h1>
          <p className="text-gray-600">Document your training session with photos and details</p>
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
            required={false}
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
                  Adding Session...
                </span>
              ) : (
                "Add Session"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSession;