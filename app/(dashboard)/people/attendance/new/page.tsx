'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { User } from '@/types';
import { userService } from '@/services/api';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

export default function NewAttendancePage() {
  const router = useRouter();
  const { setCurrentModule } = useAppStore();
  const { user: authUser } = useAuthStore();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = authUser?.role || 'Employee';
  const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(userRole);

  useEffect(() => {
    setCurrentModule('people');
    loadEmployees();
  }, [setCurrentModule]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      if (isPrivilegedUser) {
        // Privileged users can see all employees
        const allUsers = await userService.getUsers();
        setEmployees(allUsers);
      } else {
        // Regular employees only see themselves
        if (authUser) {
          setEmployees([authUser]);
        }
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees list');
      // Fallback: if auth user exists, at least show them
      if (authUser) {
        setEmployees([authUser]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/people/attendance');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 px-4 sm:px-6 lg:px-8">
      <AttendanceForm
        employees={employees}
        onCancel={handleCancel}
        isEditing={false}
      />
    </div>
  );
}
