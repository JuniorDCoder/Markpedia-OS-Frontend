import { teamService } from "@/lib/api/teams";
import { notFound } from "next/navigation";
import EditTeamMemberForm from "@/components/sections/EditTeamMemberForm"; // ✅ default import

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const members = await teamService.getTeamMembers();
        return members.map((member: any) => ({ id: member.id }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export default async function EditTeamMemberPage({ params }: PageProps) {
    const teamMember = await teamService.getTeamMember(params.id);

    if (!teamMember) {
        notFound();
    }

    return <EditTeamMemberForm id={params.id} />;
}
