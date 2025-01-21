import { useState } from "react";


const EditPayment = () => {
  const [formData, setFormData] = useState({
    user: '',
    amount: '',
    receiptNumber: '',
    paymentDate: '',
    paymentStatus: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user) newErrors.user = 'User is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.receiptNumber) newErrors.receiptNumber = 'Receipt number is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.paymentStatus) newErrors.paymentStatus = 'Payment status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form data
      console.log('Form submitted:', formData);
    }
  };
  return (
    <div className='max-w-md mx-auto mt-10 '>
      <h2 className='text-2xl font-bold mb-5'>Edit Payment</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-1'>User</label>
          <input
            type='text'
            name='user'
            value={formData.user}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          />
          {errors.user && <p className='text-red-500 text-sm'>{errors.user}</p>}
        </div>
        <div>
          <label className='block mb-1'>Amount</label>
          <input
            type='number'
            name='amount'
            value={formData.amount}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          />
          {errors.amount && <p className='text-red-500 text-sm'>{errors.amount}</p>}
        </div>
        <div>
          <label className='block mb-1'>Receipt Number</label>
          <input
            type='text'
            name='receiptNumber'
            value={formData.receiptNumber}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          />
          {errors.receiptNumber && <p className='text-red-500 text-sm'>{errors.receiptNumber}</p>}
        </div>
        <div>
          <label className='block mb-1'>Payment Date</label>
          <input
            type='date'
            name='paymentDate'
            value={formData.paymentDate}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          />
          {errors.paymentDate && <p className='text-red-500 text-sm'>{errors.paymentDate}</p>}
        </div>
        <div>
          <label className='block mb-1'>Payment Status</label>
          <select
            name='paymentStatus'
            value={formData.paymentStatus}
            onChange={handleChange}
            className='w-full border rounded px-3 py-2'
          >
            <option value=''>Select status</option>
            <option value='paid'>Paid</option>
            <option value='unpaid'>Unpaid</option>
            <option value='cancelled'>Cancelled</option>
          </select>
          {errors.paymentStatus && <p className='text-red-500 text-sm'>{errors.paymentStatus}</p>}
        </div>
        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
          Update Payment
        </button>
      </form>
    </div>
  );
};
export default EditPayment;