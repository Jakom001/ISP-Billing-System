import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, Eye, CheckCircle, XCircle, PlusCircle, Search, Filter, Trash2, Edit, Users, Building2, BookOpen, TrendingUp, Award, UserCheck } from 'lucide-react';

// Mock contexts - replace with your actual context imports
const useAuthContext = () => ({
  currentUser: { firstName: 'John', lastName: 'Asiimwe', role: 'businessCoach' },
  isAuthenticated: true
});

const useEnterpriseContext = () => ({
  enterprises: [
    { _id: '1', name: 'Sentamu Tech Solutions', industry: 'Technology', noStaff: 150, city: 'Kampala', active: true, createdAt: '2024-01-15' },
    { _id: '2', name: 'Gonja Farm Solutions', industry: 'Agriculture', noStaff: 85, city: 'Mukono', active: true, createdAt: '2024-02-20' },
    { _id: '3', name: 'Peak Meat Packers Uganda', industry: 'Food Processing', noStaff: 200, city: 'Gulu', active: true, createdAt: '2024-03-10' },
    { _id: '4', name: 'Nalongo Hotels & Resorts', industry: 'Hospitality', noStaff: 45, city: 'Entebbe', active: false, createdAt: '2024-01-25' },
    { _id: '5', name: 'Buganda FinServe', industry: 'Finance', noStaff: 320, city: 'Masindi', active: true, createdAt: '2024-02-05' }
  ]
});

const useTraineeContext = () => ({
  trainees: [
    { _id: '1', firstName: 'Alice', lastName: 'Namatovu', position: 'CEO', gender: 'Female', ageBracket: '36-45', enterprise: { name: 'Sentamu Tech Solutions' }, active: true },
    { _id: '2', firstName: 'Robert', lastName: 'Muwonge', position: 'Director', gender: 'Male', ageBracket: '45-60', enterprise: { name: 'Sentamu Tech Solutions' }, active: true },
    { _id: '3', firstName: 'Grace', lastName: 'Nabirye', position: 'Senior Management', gender: 'Female', ageBracket: '36-45', enterprise: { name: 'Gonja Farm Solutions' }, active: true },
    { _id: '4', firstName: 'James', lastName: 'Okello', position: 'Middle Management', gender: 'Male', ageBracket: '18-35', enterprise: { name: 'Peak Meat Packers Uganda' }, active: true },
    { _id: '5', firstName: 'Mary', lastName: 'Namukasa', position: 'Technical Level', gender: 'Female', ageBracket: '18-35', enterprise: { name: 'Buganda FinServe' }, active: true },
    { _id: '6', firstName: 'David', lastName: 'Kiggundu', position: 'Director', gender: 'Male', ageBracket: '45-60', enterprise: { name: 'Nalongo Hotels & Resorts' }, active: false }
  ]
});

const useSessionContext = () => ({
  sessions: [
    { _id: '1', name: 'Session 1', rating: 4.5, duration: 120, date: '2024-06-01', enterprise: { name: 'Sentamu Tech Solutions' }, outcome: 'Excellent engagement' },
    { _id: '2', name: 'Session 2', rating: 4.2, duration: 180, date: '2024-06-05', enterprise: { name: 'Gonja Farm Solutions' }, outcome: 'Good participation' },
    { _id: '3', name: 'Session 3', rating: 4.8, duration: 90, date: '2024-06-10', enterprise: { name: 'Peak Meat Packers Uganda' }, outcome: 'Outstanding results' },
    { _id: '4', name: 'Session 4', rating: 4.1, duration: 150, date: '2024-06-12', enterprise: { name: 'Sentamu Tech Solutions' }, outcome: 'Needs follow-up' },
    { _id: '5', name: 'Session 5', rating: 4.6, duration: 200, date: '2024-06-15', enterprise: { name: 'Buganda FinServe' }, outcome: 'Excellent progress' },
    { _id: '6', name: 'Session 6', rating: 3.9, duration: 240, date: '2024-06-18', enterprise: { name: 'Nalongo Hotels & Resorts' }, outcome: 'Average engagement' }
  ]
});

const Dashboard = () => {
  const { currentUser } = useAuthContext();
  const { enterprises } = useEnterpriseContext();
  const { trainees } = useTraineeContext();
  const { sessions } = useSessionContext();

  // Calculate statistics
  const stats = {
    totalEnterprises: enterprises.length,
    activeEnterprises: enterprises.filter(e => e.active).length,
    totalTrainees: trainees.length,
    activeTrainees: trainees.filter(t => t.active).length,
    totalSessions: sessions.length,
    averageRating: sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length,
    totalTrainingHours: sessions.reduce((acc, s) => acc + s.duration, 0) / 60
  };

  // Prepare chart data
  const industryData = enterprises.reduce((acc, enterprise) => {
    const industry = enterprise.industry || 'Other';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {});

  const industryChartData = Object.entries(industryData).map(([industry, count]) => ({
    industry,
    count
  }));

  const positionData = trainees.reduce((acc, trainee) => {
    const position = trainee.position.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {});

  const positionChartData = Object.entries(positionData).map(([position, count]) => ({
    position,
    count
  }));

  const genderData = trainees.reduce((acc, trainee) => {
    acc[trainee.gender] = (acc[trainee.gender] || 0) + 1;
    return acc;
  }, {});

  const genderChartData = Object.entries(genderData).map(([gender, count]) => ({
    gender,
    count
  }));

  const monthlySessionData = sessions.reduce((acc, session) => {
    const month = new Date(session.date).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.sessions += 1;
      existing.avgRating = (existing.avgRating + session.rating) / 2;
    } else {
      acc.push({ month, sessions: 1, avgRating: session.rating });
    }
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PTS Dashboard</h1>
             
            </div>
            {/* <div className="flex items-center gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <PlusCircle size={20} />
                Quick Add
              </button>
            </div> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enterprises</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnterprises}</p>
                <p className="text-sm text-green-600">{stats.activeEnterprises} active</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrainees}</p>
                <p className="text-sm text-green-600">{stats.activeTrainees} active</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Business Coaching Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
                <p className="text-sm text-blue-600">{stats.totalTrainingHours.toFixed(1)} hours</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-yellow-600">★ Out of 5.0</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Industry Distribution */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprises by Industry</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trainee Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ gender, percent }) => `${gender} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Position Distribution */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Particepants by Position</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="position" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Sessions Trend */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Training Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sessions" fill="#3B82F6" name="Sessions" />
                <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#F59E0B" strokeWidth={3} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Business Coaching Sessions</h3>
            </div>
            <div className="divide-y">
              {sessions.slice(0, 5).map((session) => (
                <div key={session._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{session.name}</h4>
                      <p className="text-sm text-gray-600">{session.enterprise.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {session.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{session.rating}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.rating >= 4.5 ? 'bg-green-100 text-green-800' :
                        session.rating >= 4.0 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.rating >= 4.5 ? 'Excellent' : session.rating >= 4.0 ? 'Good' : 'Average'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Enterprises */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Enterprise Overview</h3>
            </div>
            <div className="divide-y">
              {enterprises.filter(e => e.active).slice(0, 5).map((enterprise) => {
                const enterpriseTrainees = trainees.filter(t => t.enterprise.name === enterprise.name);
                const enterpriseSessions = sessions.filter(s => s.enterprise.name === enterprise.name);
                
                return (
                  <div key={enterprise._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{enterprise.name}</h4>
                        <p className="text-sm text-gray-600">{enterprise.industry} • {enterprise.city}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={12} />
                            {enterprise.noStaff} staff
                          </span>
                          <span className="text-xs text-gray-500">
                            {enterpriseTrainees.length} Particepants
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {enterpriseSessions.length} sessions
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          enterprise.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enterprise.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;