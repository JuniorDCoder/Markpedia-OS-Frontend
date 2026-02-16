'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceDetails } from '@/components/sections/AttendanceDetails';
import { attendanceService, FrontendAttendanceRecord } from '@/services/attendanceService';
import { useAppStore } from '@/store/app';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface PageProps {
    params: { id: string };
}

export default function AttendanceDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { setCurrentModule } = useAppStore();
    const [attendance, setAttendance] = useState<FrontendAttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCurrentModule('people');
        loadAttendance();
    }, [params.id, setCurrentModule]);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const record = await attendanceService.getAttendance(params.id);
            setAttendance(record);
        } catch (error) {
            console.error('Failed to load attendance:', error);
            toast.error('Failed to load attendance record');
            router.push('/people/attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: FrontendAttendanceRecord) => {
        router.push(`/people/attendance/${record.id}/edit`);
    };

    const handleDelete = (recordId: string) => {
        router.push('/people/attendance');
    };

    const handleBack = () => {
        router.push('/people/attendance');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">Loading attendance details...</p>
                </div>
            </div>
        );
    }

    if (!attendance) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Attendance Record Not Found</h1>
                <button
                    onClick={handleBack}
                    className="text-blue-600 hover:underline"
                >
                    Back to Attendance
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 px-4 sm:px-6 lg:px-8 pt-6">
            <AttendanceDetails
                attendance={attendance}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBack={handleBack}
            />
        </div>
    );
}