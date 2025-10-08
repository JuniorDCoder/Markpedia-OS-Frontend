import { notFound } from 'next/navigation';
import { User } from '@/types/chat';
import ProfileClient from '@/components/sections/profile/ProfileClient';
import { mockUserProfile } from '@/lib/mock-profile-data';

const mockCurrentUser: User = {
    id: '1',
    email: 'sarah@markpedia.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'CEO',
    department: 'Executive',
    position: 'Chief Executive Officer',
    isActive: true,
    avatar: '/avatars/sarah.jpg',
    status: 'online'
};

async function getProfileData() {
    return new Promise<{
        currentUser: User;
        profile: any;
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                currentUser: mockCurrentUser,
                profile: mockUserProfile
            });
        }, 100);
    });
}

export default async function ProfilePage() {
    const profileData = await getProfileData();

    return <ProfileClient {...profileData} />;
}