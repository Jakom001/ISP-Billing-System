import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AddPackage from './componets/AddPackage'
import PackagesList from './componets/PackagesList'
import UsersList from './componets/UsersList'
import AddPayment from "./componets/AddPayment"
import { UserContextProvider } from './context/UserContext'
import AddUser from './componets/AddUser'
import UpdatePackage from './componets/UpdatePackage'
import UpdateUser from './componets/UpdateUser'
import PaymentsList from './componets/PaymentsList'
import { PaymentContextProvider } from './context/PaymentContext'
import { PackageContextProvider } from './context/packageContext'
import UpdatePayment from './componets/UpdatePayment'
import Navbar from './componets/Navbar'
import Dashboard from './componets/Dashboard'
import Login from './componets/Login'
import Register from './componets/Register'
const App = () => {
  return (
    <Router>
      <div className="h-screen py-6 px-4 sm:px-6 lg:px-8">
        <Navbar />

        <Routes>

          {/* Authentication */}
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
        {/* Packages */}
        <Route path="/packages" element={<PackageContextProvider><PackagesList /></PackageContextProvider>} />
        <Route path="/packages/add" element={<PackageContextProvider><AddPackage /></PackageContextProvider>} />
        <Route path="/packages/update/:id" element={<PackageContextProvider><UpdatePackage /></PackageContextProvider>} />

        {/* Users */}
        <Route path="/users" element={<UserContextProvider><UsersList /></UserContextProvider>} />
        <Route path="/users/add" element={<UserContextProvider> <PackageContextProvider> <AddUser /></PackageContextProvider></UserContextProvider>} />
        <Route path="/users/update/:id" element={<UserContextProvider><PackageContextProvider><UpdateUser /></PackageContextProvider></UserContextProvider>} />

        {/* Payments */}
        <Route path="/payments" element={<PaymentContextProvider><PaymentsList/></PaymentContextProvider>} />
        <Route path="/payments/add" element={<PaymentContextProvider><UserContextProvider><AddPayment/></UserContextProvider></PaymentContextProvider>} />
        <Route path="/payments/update/:id" element={<PaymentContextProvider><UserContextProvider><UpdatePayment/></UserContextProvider></PaymentContextProvider>} />
        
        <Route path="/" element={<Dashboard />} />
        
      </Routes>
        
      </div>
      
    </Router>
  )
}

export default App