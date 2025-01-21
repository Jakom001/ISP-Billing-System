import React, { useState } from 'react'
import {loginUser} from "../api/authApi"
const Login = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
})

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () =>{
    const newErrors = {};

    if (!formData.email.trim()){
      newErrors.email = "email is required";
    }else if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
      newErrors.email = "Invalid email address";
    }

    if (!formData.password){
      newErrors.password = "Password is required";
    }
    if (formData.password.length < 8){
      newErrors.password = "Password must be at least 8 characters long";
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
        await loginUser(formData);
        
        setSubmitted(true)

        // Reset Form
        setFormData({
          email:"",
          password: "",
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
            Login 
          </h2>
          {submitted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              You have successfully login!
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
            
              <button
                type="submit"
                className=" bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Login
              </button>
            
             
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login