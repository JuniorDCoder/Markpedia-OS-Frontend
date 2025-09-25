import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { attendanceService } from '@/services/api';
import { AttendanceRecord } from '@/types';

interface PageProps {
    params: { id: string };
}

// Generate static params for pre-rendering (optional - remove if you don't need it)
export async function generateStaticParams() {
    try {
        const attendanceRecords = await attendanceService.getAttendanceRecords();
        // Only pre-render recent records or limit the number
        return attendanceRecords.slice(0, 10).map((record) => ({ id: record.id }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps){
    try {
        const attendance = await attendanceService.getAttendanceRecord(params.id);
        return {
            title: `Edit ${attendance.userName} - ${attendance.date} | Attendance`,
            description: `Edit attendance record for ${attendance.userName} on ${attendance.date}`,
        };
    } catch (error) {
        return {
            title: 'Edit Attendance Record | People Management',
            description: 'Edit attendance details and records',
        };
    }
}

export default async function EditAttendancePage({ params }: PageProps) {
    let attendance: AttendanceRecord | null = null;

    try {
        attendance = await attendanceService.getAttendanceRecord(params.id);
    } catch (error) {
        console.error('Failed to fetch attendance record:', error);
    }

    if (!attendance) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Record Not Found</h2>
                    <p className="text-gray-600">The requested attendance record could not be found for editing.</p>
                </div>
            </div>
        );
    }

    return <AttendanceForm initialData={attendance} isEdit={true} />;
}