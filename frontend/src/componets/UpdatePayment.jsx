import React, { useState, useEffect } from "react";
import { usePaymentContext } from "../context/PaymentContext";
import { updatePayment, getPaymentById } from "../api/paymentApi";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useUserContext } from "../context/UserContext";
import moment from 'moment';
const UpdatePayment = () => {
  const { fetchPayments } = usePaymentContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    receiptNumber: "",
    paymentMethod: "",
    paymentDate: "",
    checked: "",
    comment: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const paymentMethods = [
    {value: 'cash', label: "Cash"},
    {value: 'bank', label: "Bank"},
    {value: 'mpesa', label: "M-pesa"},
  ]

  const checkedStatuses = [
    {value: 'yes', label: "Yes"},
    {value: 'no', label: "No"},
  ]

  const { users, fetchUsers } = useUserContext();
    
  useEffect(() => {
     fetchUsers();
   }, [fetchUsers]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await getPaymentById(id);
        const paymentData = response.data.data;
        setFormData({
          userId: paymentData. user?._id || "",
          amount: paymentData.amount || "",
          receiptNumber: paymentData.receiptNumber || "",
          paymentMethod: paymentData.paymentMethod || "",
          paymentDate: paymentData.paymentDate || "", 
          checked: paymentData.checked || "",
          comment: paymentData.comment || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setErrors({ submit: "Failed to fetch payment details. Please try again." });
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id]);

  

     const validateForm = () =>{
      const newErrors = {};
  
      if (!formData.userId){
          newErrors.userId = "User is required"
      } 
      if (!formData.amount){
          newErrors.amount = "Amount is required"
      }
      if (!formData.receiptNumber.trim()){
          newErrors.receiptNumber = "Receipt number is required"
      }
      if (!formData.paymentMethod){
          newErrors.paymentMethod = "Payment method is required"
      }else if(!["cash", "bank", "mpesa"].includes(formData.paymentMethod)){
          newErrors.paymentMethod = "Invalid payment method"
      }
  
      if (!formData.paymentDate.trim()){
          newErrors.paymentDate = "Payment date is required"
      }
      
      if (!formData.checked){
          newErrors.checked = "Checked status is required"
      }else if(!["yes", "no",].includes(formData.checked)){
          newErrors.checked = "Invalid checked status"
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

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await updatePayment(id, formData);
        setSubmitted(true);
        setErrors({});

        // Fetch updated payments
        await fetchPayments();
        setTimeout(() => {
          setSubmitted(false);
          navigate('/payments'); 
        }, 3000);
      } catch (error) {

        console.error("Submission Error", error);
        const backendError =
          error.response?.data?.message || "Failed to update payment. Please try again.";
        setErrors((prev) => ({
          ...prev,
          submit: backendError,
        }));
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white text-blackColor shadow-md rounded-lg px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Update Payment
          </h2>
          {submitted && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              Payment updated successfully!
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                name="userId"
                disabled
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select User</option>
                {users.map((usr) => (
                  <option key={usr._id} value={usr._id}>
                    {usr.username}
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" disabled name="amount" id="amount" value={formData.amount} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md" />
                    {errors.amount && <p className="text-red-500">{errors.amount}</p>}
                </div>
                <div>
                    <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700">Receipt Number</label>
                    <input type="text" name="receiptNumber" id="receiptNumber" value={formData.receiptNumber} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md" />
                    {errors.receiptNumber && <p className="text-red-500">{errors.receiptNumber}</p>}
                </div>
                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md">
                        <option value="">Select Payment Method</option>
                        {paymentMethods.map(method => (
                            <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                    </select>
                    {errors.paymentMethod && <p className="text-red-500">{errors.paymentMethod}</p>}
                </div>
                <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
                    <input type="datetime-local"  name="paymentDate" id="paymentDate" value={formData.paymentDate} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md" />
                    {errors.paymentDate && <p className="text-red-500">{errors.paymentDate}</p>}
                </div>
               
                <div>
                    <label htmlFor="checked" className="block text-sm font-medium text-gray-700">Checked</label>
                    <select name="checked" id="checked" value={formData.checked} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md">
                        <option value="">Select Checked Status</option>
                        {checkedStatuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                    {errors.checked && <p className="text-red-500">{errors.checked}</p>}
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                    <textarea name="comment" id="comment" value={formData.comment} onChange={handleChange} className="mt-1 p-2 border border-gray-300 block w-full rounded-md" />
                    {errors.comment && <p className="text-red-500">{errors.comment}</p>}
                </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className=" bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Update Payment
              </button>

              <button className="mt-4">
                <Link to="/payments" className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">Cancel</Link>
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePayment;
