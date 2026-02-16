'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { attendanceService, FrontendAttendanceRecord } from '@/services/attendanceService';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { userService } from '@/services/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

interface PageProps {
    params: { id: string };
}

export default function EditAttendancePage({ params }: PageProps) {
    const router = useRouter();
    const { setCurrentModule } = useAppStore();
    const { user: authUser } = useAuthStore();
    const [attendance, setAttendance] = useState<FrontendAttendanceRecord | null>(null);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const userRole = authUser?.role || 'Employee';
    const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(userRole);

    useEffect(() => {
        setCurrentModule('people');
        loadData();
    }, [params.id, setCurrentModule]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [record, users] = await Promise.all([
                attendanceService.getAttendance(params.id),
                isPrivilegedUser ? userService.getUsers() : Promise.resolve(authUser ? [authUser] : [])
            ]);
            setAttendance(record);
            setEmployees(users);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load attendance record');
            router.push('/people/attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/people/attendance/${params.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">Loading attendance record...</p>
                </div>
            </div>
        );
    }

    if (!attendance) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Attendance Record Not Found</h1>
                <button
                    onClick={() => router.push('/people/attendance')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Attendance
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 px-4 sm:px-6 lg:px-8">
            <AttendanceForm
                record={attendance}
                employees={employees}
                onCancel={handleCancel}
                isEditing={true}
            />
        </div>
    );
}