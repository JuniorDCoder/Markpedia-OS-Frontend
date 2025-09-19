import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2 } from 'lucide-react';

interface Report {
  taskId: string;
  title: string;
  reportContent: string;
  submittedBy: string;
}

interface ReviewReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onReview: (taskId: string) => void;
  tasks: any[];
}

export default function ReviewReportsModal({ isOpen, onClose, reports, onReview, tasks }: ReviewReportsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Submitted Task Reports
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {reports.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No submitted reports to review.
            </div>
          ) : (
            reports.map(report => {
              const task = tasks.find(t => t.id === report.taskId);
              return (
                <Card key={report.taskId} className="border-blue-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <Badge>{task?.status || 'Unknown'}</Badge>
                      </div>
                      {task?.status === 'Done' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Reviewed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onReview(report.taskId)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Mark as Reviewed
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                      <strong>Report:</strong> {report.reportContent}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Submitted by: {report.submittedBy}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

