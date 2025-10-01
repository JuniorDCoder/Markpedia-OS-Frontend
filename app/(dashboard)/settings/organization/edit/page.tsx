import { redirect } from 'next/navigation';
import { User } from '@/types';
import {Organization} from "@/types/settings";
import OrganizationEditClient from "@/components/sections/settings/organization/edit/OrganizationEditClient";

const mockOrganization: Organization = {
    id: '1',
    name: 'TechCorp Africa',
    legalName: 'TechCorp Africa SARL',
    registrationNumber: 'RC/CM2024/12345',
    taxId: 'M123456789',
    industry: 'Technology',
    size: '11-50',
    foundedYear: 2020,
    website: 'https://techcorp.cm',
    phone: '+237 6 12 34 56 78',
    email: 'info@techcorp.cm',
    timezone: 'Africa/Douala',
    fiscalYearStart: '01-01'
};

const mockUser: User = {
    id: '1',
    email: 'ceo@techcorp.cm',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'CEO',
    isActive: true,
    createdAt: '2020-01-15'
};

export default function OrganizationEditPage() {
    if (!['CEO', 'Admin'].includes(mockUser.role)) {
        redirect('/settings');
    }

    return <OrganizationEditClient organization={mockOrganization} user={mockUser} />;
}