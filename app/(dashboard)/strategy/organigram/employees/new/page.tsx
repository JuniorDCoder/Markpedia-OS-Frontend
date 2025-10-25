import { redirect } from 'next/navigation';
import { Department, User, Entity } from '@/types';
import EmployeeNewClient from "@/components/sections/organigram/employees/new/EmployeeNewClient";

// @ts-ignore
const mockDepartments: Department[] = [
    { id: '1', name: 'Executive', color: '#8B5CF6', description: 'Global leadership', memberCount: 1 },
    { id: '2', name: 'Operations', color: '#3B82F6', description: 'Global and regional operations', memberCount: 2 },
    { id: '3', name: 'Technology', color: '#10B981', description: 'Tech teams across all levels', memberCount: 3 },
    { id: '4', name: 'Finance', color: '#F59E0B', description: 'Financial management', memberCount: 1 },
    { id: '5', name: 'Marketing', color: '#EF4444', description: 'Marketing and communications', memberCount: 2 },
    { id: '6', name: 'Sales', color: '#06B6D4', description: 'Sales and business development', memberCount: 0 },
    { id: '7', name: 'HR', color: '#9333EA', description: 'Human resources', memberCount: 0 },
    { id: '8', name: 'Logistics', color: '#84CC16', description: 'Logistics and supply chain', memberCount: 1 },
    { id: '9', name: 'Legal', color: '#F97316', description: 'Legal and compliance', memberCount: 0 },
    { id: '10', name: 'Regional Management', color: '#EC4899', description: 'Regional leadership', memberCount: 1 },
    { id: '11', name: 'Country Management', color: '#8B5CF6', description: 'Country leadership', memberCount: 1 }
];

const mockEntities: Entity[] = [
    // Global Level Entities
    {
        id: 'global-1',
        name: 'Markpedia Inc.',
        level: 'Global',
        parentId: undefined,
        country: 'USA',
        headName: 'Ngu Divine',
        email: 'ceo@markpedia.com',
        establishedDate: '2023-01-01',
        active: true
    },
    {
        id: 'global-2',
        name: 'Global Innovation Center',
        level: 'Global',
        parentId: 'global-1',
        country: 'USA',
        headName: 'Global CTO',
        email: 'cto@markpedia.com',
        establishedDate: '2023-02-01',
        active: true
    },

    // Regional Level Entities
    {
        id: 'region-1',
        name: 'Africa Region',
        level: 'Regional',
        parentId: 'global-1',
        country: 'Nigeria',
        headName: 'Regional Director - Africa',
        email: 'africa.director@markpedia.com',
        establishedDate: '2023-03-01',
        active: true
    },
    {
        id: 'region-2',
        name: 'Asia-Pacific Region',
        level: 'Regional',
        parentId: 'global-1',
        country: 'China',
        headName: 'Regional Director - APAC',
        email: 'apac.director@markpedia.com',
        establishedDate: '2023-03-15',
        active: true
    },
    {
        id: 'region-3',
        name: 'MENA Region',
        level: 'Regional',
        parentId: 'global-1',
        country: 'UAE',
        headName: 'Regional Director - MENA',
        email: 'mena.director@markpedia.com',
        establishedDate: '2023-04-01',
        active: true
    },
    {
        id: 'region-4',
        name: 'Europe Region',
        level: 'Regional',
        parentId: 'global-1',
        country: 'France',
        headName: 'Regional Director - Europe',
        email: 'europe.director@markpedia.com',
        establishedDate: '2023-04-15',
        active: true
    },

    // Country Level Entities - Africa Region
    {
        id: 'country-1',
        name: 'Markpedia Cameroon SARL',
        level: 'Country',
        parentId: 'region-1',
        country: 'Cameroon',
        headName: 'Country Director - Cameroon',
        email: 'cameroon.director@markpedia.com',
        establishedDate: '2023-05-01',
        active: true
    },
    {
        id: 'country-2',
        name: 'Markpedia Nigeria Ltd',
        level: 'Country',
        parentId: 'region-1',
        country: 'Nigeria',
        headName: 'Country Director - Nigeria',
        email: 'nigeria.director@markpedia.com',
        establishedDate: '2023-05-15',
        active: true
    },
    {
        id: 'country-3',
        name: 'Markpedia Kenya Ltd',
        level: 'Country',
        parentId: 'region-1',
        country: 'Kenya',
        headName: 'Country Director - Kenya',
        email: 'kenya.director@markpedia.com',
        establishedDate: '2023-06-01',
        active: true
    },

    // Country Level Entities - Asia-Pacific Region
    {
        id: 'country-4',
        name: 'Markpedia China Branch',
        level: 'Country',
        parentId: 'region-2',
        country: 'China',
        headName: 'Country Director - China',
        email: 'china.director@markpedia.com',
        establishedDate: '2023-06-15',
        active: true
    },
    {
        id: 'country-5',
        name: 'Markpedia Vietnam Ltd',
        level: 'Country',
        parentId: 'region-2',
        country: 'Vietnam',
        headName: 'Country Director - Vietnam',
        email: 'vietnam.director@markpedia.com',
        establishedDate: '2023-07-01',
        active: true
    },

    // Country Level Entities - MENA Region
    {
        id: 'country-6',
        name: 'Markpedia Egypt Ltd',
        level: 'Country',
        parentId: 'region-3',
        country: 'Egypt',
        headName: 'Country Director - Egypt',
        email: 'egypt.director@markpedia.com',
        establishedDate: '2023-07-15',
        active: true
    },
    {
        id: 'country-7',
        name: 'Markpedia Saudi Arabia Ltd',
        level: 'Country',
        parentId: 'region-3',
        country: 'Saudi Arabia',
        headName: 'Country Director - Saudi Arabia',
        email: 'saudiarabia.director@markpedia.com',
        establishedDate: '2023-08-01',
        active: true
    },

    // Country Level Entities - Europe Region
    {
        id: 'country-8',
        name: 'Markpedia France SARL',
        level: 'Country',
        parentId: 'region-4',
        country: 'France',
        headName: 'Country Director - France',
        email: 'france.director@markpedia.com',
        establishedDate: '2023-08-15',
        active: true
    },
    {
        id: 'country-9',
        name: 'Markpedia Germany GmbH',
        level: 'Country',
        parentId: 'region-4',
        country: 'Germany',
        headName: 'Country Director - Germany',
        email: 'germany.director@markpedia.com',
        establishedDate: '2023-09-01',
        active: true
    },

    // Inactive/Archived Entities
    {
        id: 'country-10',
        name: 'Markpedia South Africa Ltd',
        level: 'Country',
        parentId: 'region-1',
        country: 'South Africa',
        headName: 'Country Director - South Africa',
        email: 'southafrica.director@markpedia.com',
        establishedDate: '2023-05-01',
        active: false
    }
];

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO'
};

export default function EmployeeNewPage() {
    // Only CEOs, Admins, and CXOs can create employees
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/strategy/organigram');
    }

    return (
        <EmployeeNewClient
            departments={mockDepartments}
            entities={mockEntities}
            user={mockUser}
        />
    );
}