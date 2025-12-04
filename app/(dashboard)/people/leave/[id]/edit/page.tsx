"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import EditLeaveRequestClient from "@/components/sections/EditLeaveRequestClient";
import { leaveRequestService } from "@/services/leaveRequestService";
import { taskService, projectService, userService } from "@/services/api";
import { useAppStore } from "@/store/app";
import toast from "react-hot-toast";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditLeaveRequestPage({ params }: PageProps) {
  const router = useRouter();
  const { setCurrentModule } = useAppStore();

  const [initialData, setInitialData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentModule("people");
    loadData();
  }, [params.id, setCurrentModule]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [lr, tks, prjs, usrs] = await Promise.all([
        leaveRequestService.getLeaveRequest(params.id),
        taskService.getTasks().catch(() => []),
        projectService.getProjects().catch(() => []),
        userService.getUsers().catch(() => []),
      ]);

      setInitialData(lr || null);
      setTasks(Array.isArray(tks) ? tks : []);
      setProjects(Array.isArray(prjs) ? prjs : []);
      setUsers(Array.isArray(usrs) ? usrs : []);

      if (!lr) {
        setError("Leave request not found");
        toast.error("Leave request not found");
        setTimeout(() => router.push("/people/leave"), 2000);
      }
    } catch (err: any) {
      console.error("Error fetching edit page data:", err);

      if (err?.status === 401 || err?.status === 403) {
        setError("You don't have permission to edit this leave request.");
        toast.error("Access denied");
      } else if (err?.status === 404) {
        setError("Leave request not found.");
        toast.error("Leave request not found");
        setTimeout(() => router.push("/people/leave"), 2000);
      } else {
        setError("Failed to load leave request data.");
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-muted-foreground">Loading leave request data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error.includes("permission") || error.includes("Access")
                ? "Please sign in or contact your administrator for access."
                : "Please try again or contact support if the problem persists."}
            </p>
            <div className="flex gap-2">
              {error.includes("permission") ? (
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              ) : (
                <Button onClick={handleRetry}>Try Again</Button>
              )}
              <Button asChild variant="outline">
                <Link href="/people/leave">Back to Leave Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Leave Request Not Found</h1>
        <button
          onClick={() => router.push("/people/leave")}
          className="text-blue-600 hover:underline"
        >
          Back to Leave Requests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 px-4 sm:px-6 lg:px-8 pt-6">
      {/* Client component expects props: leaveRequestId, initialData, tasks, projects, users */}
      <EditLeaveRequestClient
        leaveRequestId={params.id}
        initialData={initialData}
        tasks={tasks}
        projects={projects}
        users={users}
      />
    </div>
  );
}