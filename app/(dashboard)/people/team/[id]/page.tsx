import { notFound } from 'next/navigation';
import { teamService } from '@/lib/api/teams';
import { TeamMemberDetailClient } from "@/components/sections/TeamMemberDetailClient";

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    try {
        const members = await teamService.getTeamMembers()
        return members.map((member: any) => ({ id: member.id }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function TeamMemberDetailPage({ params }: PageProps) {
    const teamMember = await teamService.getTeamMember(params.id);

    if (!teamMember) {
        notFound();
    }

    return <TeamMemberDetailClient teamMember={teamMember} />;
}
