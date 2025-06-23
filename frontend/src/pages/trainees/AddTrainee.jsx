import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTraineeContext } from '../../context/TraineeContext';
import { useEnterpriseContext } from '../../context/EnterpriseContext';
import { toast } from 'react-toastify';

const AddTrainee = () => {
  const navigate = useNavigate();
  const { addTrainee, loading, clearError } = useTraineeContext();
  const { enterprises } = useEnterpriseContext();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    position: '',
    ageBracket: '',
    enterpriseId: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    
    // Required field validations
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      // Email format validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    
    if (!formData.position) {
      newErrors.position = "Position is required";
    }
    
    if (!formData.ageBracket) {
      newErrors.ageBracket = "Age bracket is required";
    }
    
    if (!formData.enterpriseId) {
      newErrors.enterpriseId = "Enterprise is required";
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
    clearError();
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
    
    const result = await addTrainee(formData);

    if (result.data) {
      toast.success(result.success || "Trainee added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        position: '',
        ageBracket: '',
        enterpriseId: '',
      });
      
      setTimeout(() => {
              navigate('/participants');
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

  const positionOptions = [
    { value: 'ceo', label: 'CEO' },
    { value: 'director', label: 'Director' },
    { value: 'senior Management', label: 'Senior Management' },
    { value: 'middle Management', label: 'Middle Management' },
    { value: 'technical level', label: 'Technical Level' },
    { value: 'others', label: 'Others' }
  ];

  const ageBracketOptions = [
    { value: '18-35', label: '18-35' },
    { value: '36-45', label: '36-45' },
    { value: '45-60', label: '45-60' },
    { value: 'Above 60', label: 'Above 60' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  return (
    <div className='mx-auto max-w-2xl text-center bg-gray-50 min-h-screen py-8'>
      <div className="bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-2px]">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <h1 className='text-3xl font-bold text-gray-900'>Add New Particepants</h1>
          <p className='text-gray-600'>Fill in the details to register a new trainee</p>
        </div>
    
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">Personal Information</h2>
            
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-left text-sm font-medium text-gray-700 mb-2">
                  First Name<span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 border ${
                    formErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && (
                  <div className="text-left text-red-500 text-xs mt-1">
                    {formErrors.firstName}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-left text-sm font-medium text-gray-700 mb-2">
                  Last Name<span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 border ${
                    formErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && (
                  <div className="text-left text-red-500 text-xs mt-1">
                    {formErrors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Email Address<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {formErrors.email && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.email}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Phone Number<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {formErrors.phone && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.phone}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Gender<span className='text-red-500 font-bold'>*</span>
              </label>
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  formErrors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              >
                <option value="">Select Gender</option>
                {genderOptions.map(option => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
              {formErrors.gender && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.gender}
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">Professional Information</h2>
            
            {/* Position */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Position<span className='text-red-500 font-bold'>*</span>
              </label>
              <select 
                name="position" 
                value={formData.position}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  formErrors.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              >
                <option value="">Select Position</option>
                {positionOptions.map(option => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
              {formErrors.position && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.position}
                </div>
              )}
            </div>

            {/* Age Bracket */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Age Bracket<span className='text-red-500 font-bold'>*</span>
              </label>
              <select 
                name="ageBracket" 
                value={formData.ageBracket}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  formErrors.ageBracket ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              >
                <option value="">Select Age Bracket</option>
                {ageBracketOptions.map(option => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
              {formErrors.ageBracket && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.ageBracket}
                </div>
              )}
            </div>

            {/* Enterprise */}
            <div className="mb-4 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Enterprise<span className='text-red-500 font-bold'>*</span>
              </label>
              <select 
                name="enterpriseId" 
                value={formData.enterpriseId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  formErrors.enterpriseId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              >
                <option value="">Select Enterprise</option>
                {enterprises && enterprises.map(enterprise => (
                  <option value={enterprise._id} key={enterprise._id}>{enterprise.name}</option>
                ))}
              </select>
              {formErrors.enterpriseId && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.enterpriseId}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Particepant...
                </span>
              ) : "Add Particepant"}
            </button>

            <Link 
              to="/participants" 
              className="bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTrainee;