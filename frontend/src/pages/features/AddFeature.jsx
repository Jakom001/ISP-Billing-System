import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureContext } from '../../context/FeatureContext';

const AddFeature= () => {
  const navigate = useNavigate();
  const { addFeature, loading, error, clearError } = useFeatureContext();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    priority: 'Medium',
    image: '',
    status: 'Pending',
    description: '',
  });
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    
    // Clear global API error
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    
    if (!validateForm()) return;
    
    const result = await addFeature(formData);

    if (result.data) {
      setSuccess("Feature added successfully!");
      setFormData({
        name: '',
        type: '',
        priority: 'Medium',
        image: '',
        status: 'Pending',
        description: '',
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/features');
      }, 2000);
    }
  };
  return (
    <div className='mx-auto max-w-xl text-center bg-gray-50'>
        <div className="bg-white p-12 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-3px]">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <h1 className='text-2xl font-bold text-gray-900'>Add Feature or Report Bug</h1>
          </div>
          
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded mb-4 transition-all duration-300">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded mb-4 transition-all duration-300">
              {error}
            </div>
          )}
      
          <form onSubmit={handleSubmit}>
            <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                Name<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter feature name"
              />
              {formErrors.name && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.name}
                </div>
              )}
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                Type<span className='text-red-500 font-bold'>*</span>
              </label>
              <select name="type" id="type" value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="" disabled>Type</option>
                <option value="feature">Feature</option>
                <option value="bugFix">Bug Fix</option>
                <option value="improvement">Improvement</option>
                <option value="other">Other</option>
              </select>

              {formErrors.type && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.type}
                </div>
              )}
            </div>
            <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                Priority
              </label>
              <select name="priority" id="priority" value={formData.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                  formErrors.priority ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>

              {formErrors.priority && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.priority}
                </div>
              )}
            </div>
              </div>

              <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                Description<span className='text-red-500 font-bold'>*</span>
              </label>
              <textarea
                className={`w-full px-3 py-2 border ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                id="description"
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter feature description"
              />
              {formErrors.description && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.description}
                </div>
              )}
            </div>
            

             <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                image URL
              </label>
              <input
                className={`w-full px-3 py-2 border ${
                  formErrors.image ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                type="name"
                name="image"
                pattern="https://.*"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://placehold.co/600x400/png"
              />
              {formErrors.image && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.image}
                </div>
              )}
            </div>

           
            

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : "Add Feature"}
              </button>

              <Link 
                to="/features" 
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

    </div>
  );
};

export default AddFeature;