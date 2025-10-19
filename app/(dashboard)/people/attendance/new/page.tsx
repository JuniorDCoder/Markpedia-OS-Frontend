'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { useAppStore } from '@/store/app';
import { User } from '@/types';
import { attendanceService } from '@/services/api';
import toast from 'react-hot-toast';

export default function NewAttendancePage() {
  const router = useRouter();
  const { setCurrentModule } = useAppStore();
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    setCurrentModule('people');
    // Load employees (mocked as in list page)
    const mockEmployees: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@markpedia.com',
        role: 'Employee',
        department: 'Engineering',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@markpedia.com',
        role: 'Manager',
        department: 'Marketing',
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@markpedia.com',
        role: 'Employee',
        department: 'Sales',
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@markpedia.com',
        role: 'HR Officer',
        department: 'HR',
      },
    ];
    setEmployees(mockEmployees);
  }, [setCurrentModule]);

  const handleCreateRecord = async (data: any) => {
    try {
      await attendanceService.createAttendanceRecord(data);
      toast.success('Attendance recorded');
      router.push('/people/attendance');
    } catch (error: any) {
      // Re-throw so the form can display any inline errors if it expects
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/people/attendance');
  };

  return (
    <div className="space-y-6 pb-10">
      <AttendanceForm
        employees={employees}
        onSave={handleCreateRecord}
        onCancel={handleCancel}
      />
    </div>
  );
}
