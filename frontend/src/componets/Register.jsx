import React, { useState } from 'react'
import {registerUser} from "../api/authApi"
const Register = () => {

  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "", 
    phone: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
})

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () =>{
    const newErrors = {};
    if (!formData.firstName.trim()){
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()){
      newErrors.lastName = "Last name is required";
    }
    if (!formData.phone.trim()){
      newErrors.phone = "Phone number is required";
    }else if (!formData.phone.match(/^[0-9]{10}$/)){
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.email.trim()){
      newErrors.email = "email is required";
    }else if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
      newErrors.email = "Invalid email address";
    }
    if (!formData.password){
      newErrors.password = "Password is required";
    }
    // strong password
    else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)){
      newErrors.password = "Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters";
    }
    if (!formData.confirmPassword){
      newErrors.confirmPassword = "Confirm Password is required";
    }else if (formData.password!== formData.confirmPassword){
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (e) =>{
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData, [name]:value,
    }));
    if(errors[name]){
      setErrors(prev =>({
        ...prev, [name]: ""
      }));
    }
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();

    if(validateForm()){
      try{
        await registerUser(formData);
        
        setSubmitted(true)

        // Reset Form
        setFormData({
          firstName: "", 
          lastName: "", 
          phone: "", 
          email: "", 
          password: "", 
          confirmPassword: "",
        })
        setTimeout(() =>setSubmitted(false), 3000)
      }catch (error){
        console.error("Submission Error", error)
         const backendError =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to submit form. Please try again.";

      // Update the errors state with the backend error
      setErrors((prev) => ({
        ...prev,
        submit: backendError,
      }));

      }
    }else{
      console.log("Form has errors", errors);
     }
  }

  return (
    <div className='py-8 px-4 sm:px-6 lg:px-8'>
      <div className="max-w-xl mx-auto mt-20">
        <div className="bg-white text-blackColor shadow-md rounded-lg px-8 py-6">
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Register 
          </h2>
          {submitted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              You have successfully registered!
            </div>
          )}
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
            </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
            </div>
            
              <button
                type="submit"
                className=" bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Register
              </button>
            
             
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register