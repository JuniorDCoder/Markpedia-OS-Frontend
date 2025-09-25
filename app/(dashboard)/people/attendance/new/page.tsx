'use client';

import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { useAppStore } from '@/store/app';
import { useEffect } from 'react';

export default function NewAttendancePage() {
    const { setCurrentModule } = useAppStore();

    useEffect(() => {
        setCurrentModule('people');
    }, [setCurrentModule]);

    return <AttendanceForm />;
}