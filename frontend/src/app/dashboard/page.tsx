'use client';

import { ProtectedLayout } from '@/components/Layout';
import { useAppointments, useDoctors } from '@/hooks/useQueries';
import { useCurrentUser } from '@/hooks/useQueries';

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: appointments } = useAppointments();
  const { data: doctors } = useDoctors();

  if (userLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg">Loading...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const upcomingAppointments = appointments?.data?.filter(
    (apt) => new Date(apt.scheduledAt) > new Date()
  );

  return (
    <ProtectedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.data?.firstName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Appointments"
            value={appointments?.data?.length || 0}
            icon="📅"
            color="bg-blue-50 border-blue-200"
          />
          <StatCard
            title="Available Doctors"
            value={doctors?.data?.length || 0}
            icon="👨‍⚕️"
            color="bg-green-50 border-green-200"
          />
          <StatCard
            title="Pending Appointments"
            value={appointments?.data?.filter((a) => a.status === 'pending').length || 0}
            icon="⏳"
            color="bg-yellow-50 border-yellow-200"
          />
          <StatCard
            title="Completed Visits"
            value={appointments?.data?.filter((a) => a.status === 'completed').length || 0}
            icon="✅"
            color="bg-purple-50 border-purple-200"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 5).map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Book Appointment"
            description="Schedule a visit with a doctor"
            href="/appointments/book"
            icon="📅"
          />
          <QuickActionCard
            title="View Records"
            description="Check your medical records"
            href="/records"
            icon="📋"
          />
          <QuickActionCard
            title="View Prescriptions"
            description="Check active prescriptions"
            href="/prescriptions"
            icon="💊"
          />
        </div>
      </div>
    </ProtectedLayout>
  );
}

// Helper Components
interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: any) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <p className="font-semibold text-gray-800">{appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
        <p className="text-sm text-gray-600">{appointment.reason}</p>
        <p className="text-sm text-gray-500">
          {new Date(appointment.scheduledAt).toLocaleString()}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {appointment.status}
      </span>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <a
      href={href}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
    >
      <span className="text-3xl mb-4 block">{icon}</span>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
