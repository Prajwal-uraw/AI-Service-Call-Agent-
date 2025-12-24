'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, Filter, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('all');

  // Demo data
  const stats = {
    scheduled: 24,
    completed: 156,
    cancelled: 8,
    pending: 12
  };

  const appointments = [
    {
      id: '1',
      customer_name: 'John Smith',
      phone: '+1 (555) 123-4567',
      service: 'AC Repair',
      technician: 'Mike Johnson',
      date: '2024-01-16',
      time: '09:00 AM',
      address: '123 Main St, Phoenix, AZ',
      status: 'scheduled',
      priority: 'normal'
    },
    {
      id: '2',
      customer_name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      service: 'Furnace Maintenance',
      technician: 'David Lee',
      date: '2024-01-16',
      time: '11:00 AM',
      address: '456 Oak Ave, Phoenix, AZ',
      status: 'scheduled',
      priority: 'normal'
    },
    {
      id: '3',
      customer_name: 'Mike Davis',
      phone: '+1 (555) 345-6789',
      service: 'Emergency Heating',
      technician: 'Mike Johnson',
      date: '2024-01-16',
      time: '02:00 PM',
      address: '789 Pine Rd, Phoenix, AZ',
      status: 'scheduled',
      priority: 'urgent'
    },
    {
      id: '4',
      customer_name: 'Emily Chen',
      phone: '+1 (555) 456-7890',
      service: 'AC Installation',
      technician: 'Sarah Williams',
      date: '2024-01-17',
      time: '10:00 AM',
      address: '321 Elm St, Phoenix, AZ',
      status: 'pending',
      priority: 'normal'
    },
    {
      id: '5',
      customer_name: 'Robert Wilson',
      phone: '+1 (555) 567-8901',
      service: 'Duct Cleaning',
      technician: 'David Lee',
      date: '2024-01-15',
      time: '03:00 PM',
      address: '654 Maple Dr, Phoenix, AZ',
      status: 'completed',
      priority: 'normal'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200'
    };

    const icons = {
      scheduled: <Calendar className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      pending: <AlertCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Urgent
        </span>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Appointments</h1>
            <p className="text-sm text-neutral-600 mt-1">Manage scheduled service appointments</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Scheduled</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.scheduled}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Completed</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.completed}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Pending</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.pending}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Cancelled</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.cancelled}</div>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center justify-between">
          <div className="inline-flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'calendar' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Calendar View
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            aria-label="Filter appointments by status"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{appointment.customer_name}</h3>
                    {getPriorityBadge(appointment.priority)}
                    {getStatusBadge(appointment.status)}
                  </div>
                  <p className="text-sm text-neutral-600">{appointment.service}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
                    Reschedule
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <User className="w-4 h-4" />
                  <span>{appointment.technician}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{appointment.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-start gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{appointment.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
