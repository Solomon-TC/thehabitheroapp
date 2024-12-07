import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStats from '../../components/admin/AdminStats';
import UserManagement from '../../components/admin/UserManagement';
import SystemHealth from '../../components/admin/SystemHealth';
import AdminLogs from '../../components/admin/AdminLogs';
import type { AdminDashboardData } from '../../types/admin';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || roleData?.role !== 'admin') {
        showNotification('Unauthorized access', 'error');
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const { data: stats, error: statsError } = await supabase
        .rpc('get_admin_stats');

      if (statsError) throw statsError;

      // Fetch recent logs
      const { data: logs, error: logsError } = await supabase
        .rpc('get_admin_logs');

      if (logsError) throw logsError;

      // Fetch system health
      const { data: health, error: healthError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'system_health')
        .single();

      if (healthError) throw healthError;

      // Fetch user reports
      const { data: reports, error: reportsError } = await supabase
        .rpc('get_user_reports');

      if (reportsError) throw reportsError;

      setDashboardData({
        stats,
        recent_logs: logs,
        system_health: health.value,
        user_reports: reports
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <AdminStats stats={dashboardData?.stats} />

        {/* System Health */}
        <SystemHealth health={dashboardData?.system_health} />

        {/* User Management */}
        <UserManagement users={dashboardData?.user_reports} onRefresh={fetchDashboardData} />

        {/* Admin Logs */}
        <AdminLogs logs={dashboardData?.recent_logs} />
      </div>
    </AdminLayout>
  );
}

// Add server-side admin check
export async function getServerSideProps({ req }: { req: any }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Check if user is admin
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!roleData || roleData.role !== 'admin') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
