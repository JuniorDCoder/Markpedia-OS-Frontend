// lib/api/performance.ts
import { PerformanceReview, PerformanceSummary, CreatePerformanceReviewData, UpdatePerformanceReviewData, PerformanceGoal, CompetencyRating } from '@/types/performance';

// Mock data
const mockPerformanceReviews: PerformanceReview[] = [
    {
        id: '1',
        employeeId: '101',
        employeeName: 'John Smith',
        reviewerId: '201',
        reviewerName: 'Sarah Johnson',
        period: 'Quarterly',
        reviewType: 'Standard',
        status: 'Completed',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        dueDate: '2024-10-15',
        completedDate: '2024-10-12',
        overallRating: 4.2,
        overallComments: 'John has shown excellent growth in leadership skills and consistently delivers high-quality work.',
        goals: [
            {
                id: 'g1',
                title: 'Complete React Advanced Certification',
                description: 'Enhance frontend development skills by completing advanced React certification',
                category: 'Technical Skills',
                targetDate: '2024-09-30',
                priority: 'High',
                status: 'Completed',
                progress: 100,
                rating: 5,
                employeeComments: 'Completed certification with distinction',
                reviewerComments: 'Excellent achievement, immediately applied learning to current projects'
            },
            {
                id: 'g2',
                title: 'Lead Team Project Migration',
                description: 'Successfully migrate legacy system to new architecture',
                category: 'Leadership',
                targetDate: '2024-12-31',
                priority: 'Critical',
                status: 'In Progress',
                progress: 75,
                rating: 4,
                employeeComments: 'Project is on track, team collaboration has been excellent',
                reviewerComments: 'Great leadership skills demonstrated throughout the project'
            }
        ],
        competencies: [
            {
                id: 'c1',
                competency: 'Technical Expertise',
                category: 'Technical',
                currentLevel: 4,
                targetLevel: 5,
                selfRating: 4,
                managerRating: 4,
                comments: 'Strong technical foundation with room to grow in system architecture',
                developmentNotes: 'Focus on distributed systems and scalability patterns'
            },
            {
                id: 'c2',
                competency: 'Team Leadership',
                category: 'Leadership',
                currentLevel: 4,
                targetLevel: 4,
                selfRating: 3,
                managerRating: 4,
                comments: 'Natural leader with excellent mentoring abilities',
                developmentNotes: 'Continue developing strategic thinking skills'
            }
        ],
        createdAt: '2024-10-01T10:00:00Z',
        updatedAt: '2024-10-12T15:30:00Z',
        createdBy: '201',
        lastModifiedBy: '201'
    },
    {
        id: '2',
        employeeId: '102',
        employeeName: 'Emily Davis',
        reviewerId: '201',
        reviewerName: 'Sarah Johnson',
        period: 'Monthly',
        reviewType: '360-Feedback',
        status: 'In Progress',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        dueDate: '2024-10-05',
        overallRating: 3.8,
        goals: [
            {
                id: 'g3',
                title: 'Improve Client Communication',
                description: 'Enhance client-facing communication skills and presentation abilities',
                category: 'Communication',
                targetDate: '2024-11-30',
                priority: 'Medium',
                status: 'In Progress',
                progress: 60,
                rating: 3,
                employeeComments: 'Attending communication workshops and practicing presentation skills',
                reviewerComments: 'Showing good progress, more confidence in client meetings'
            }
        ],
        competencies: [
            {
                id: 'c3',
                competency: 'Client Relations',
                category: 'Communication',
                currentLevel: 3,
                targetLevel: 4,
                selfRating: 3,
                managerRating: 3,
                averageRating: 3.2,
                comments: 'Building stronger relationships with clients',
                developmentNotes: 'Focus on active listening and solution-oriented discussions'
            }
        ],
        feedback360: [
            {
                id: 'f1',
                feedbackProvider: 'Anonymous Peer',
                relationship: 'Peer',
                isAnonymous: true,
                overallRating: 4,
                strengths: ['Technical expertise', 'Reliability', 'Problem-solving'],
                areasForImprovement: ['Communication in meetings', 'Proactive updates'],
                specificFeedback: 'Emily is technically very strong but could be more vocal in team discussions',
                submittedAt: '2024-10-08T14:20:00Z'
            }
        ],
        createdAt: '2024-09-25T09:00:00Z',
        updatedAt: '2024-10-08T16:45:00Z',
        createdBy: '201',
        lastModifiedBy: '102'
    },
    {
        id: '3',
        employeeId: '103',
        employeeName: 'Michael Chen',
        reviewerId: '202',
        reviewerName: 'David Wilson',
        period: 'Annual',
        reviewType: 'Standard',
        status: 'Draft',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        dueDate: '2024-12-15',
        overallRating: 0,
        goals: [
            {
                id: 'g4',
                title: 'Develop Mobile App Expertise',
                description: 'Learn React Native and deliver first mobile application',
                category: 'Professional Development',
                targetDate: '2024-12-31',
                priority: 'High',
                status: 'In Progress',
                progress: 45,
                rating: 0,
                employeeComments: 'Making steady progress on React Native course',
                reviewerComments: 'Good initiative in expanding skill set'
            }
        ],
        competencies: [
            {
                id: 'c4',
                competency: 'Innovation',
                category: 'Technical',
                currentLevel: 3,
                targetLevel: 4,
                selfRating: 3,
                managerRating: 3,
                comments: 'Shows creativity in problem-solving approaches',
                developmentNotes: 'Encourage more experimentation with new technologies'
            }
        ],
        createdAt: '2024-11-01T08:00:00Z',
        updatedAt: '2024-11-01T08:00:00Z',
        createdBy: '202',
        lastModifiedBy: '202'
    }
];

const mockPerformanceSummaries: PerformanceSummary[] = [
    {
        employeeId: '101',
        employeeName: 'John Smith',
        department: 'Engineering',
        position: 'Senior Developer',
        currentRating: 4.2,
        previousRating: 3.8,
        trend: 'Improving',
        lastReviewDate: '2024-10-12',
        nextReviewDate: '2024-12-15',
        completedReviews: 3,
        pendingReviews: 0
    },
    {
        employeeId: '102',
        employeeName: 'Emily Davis',
        department: 'Engineering',
        position: 'Frontend Developer',
        currentRating: 3.8,
        previousRating: 3.6,
        trend: 'Improving',
        lastReviewDate: '2024-09-30',
        nextReviewDate: '2024-10-31',
        completedReviews: 2,
        pendingReviews: 1
    },
    {
        employeeId: '103',
        employeeName: 'Michael Chen',
        department: 'Engineering',
        position: 'Full Stack Developer',
        currentRating: 3.5,
        previousRating: 3.5,
        trend: 'Stable',
        lastReviewDate: '2023-12-15',
        nextReviewDate: '2024-12-15',
        completedReviews: 1,
        pendingReviews: 1
    }
];

class PerformanceService {
    private reviews: PerformanceReview[] = mockPerformanceReviews;
    private summaries: PerformanceSummary[] = mockPerformanceSummaries;

    // Get all performance reviews
    async getAllPerformanceReviews(): Promise<PerformanceReview[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.reviews]), 500);
        });
    }

    // Get performance review by ID
    async getPerformanceReview(id: string): Promise<PerformanceReview | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const review = this.reviews.find(r => r.id === id);
                resolve(review || null);
            }, 300);
        });
    }

    // Get performance reviews by employee
    async getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const employeeReviews = this.reviews.filter(r => r.employeeId === employeeId);
                resolve(employeeReviews);
            }, 400);
        });
    }

    // Get performance summaries
    async getPerformanceSummaries(): Promise<PerformanceSummary[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.summaries]), 400);
        });
    }

    // Create new performance review
    async createPerformanceReview(data: CreatePerformanceReviewData): Promise<PerformanceReview> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newReview: PerformanceReview = {
                    id: (this.reviews.length + 1).toString(),
                    ...data,
                    employeeName: `Employee ${data.employeeId}`, // In real app, fetch from employee service
                    reviewerName: `Reviewer ${data.reviewerId}`, // In real app, fetch from employee service
                    status: 'Draft',
                    overallRating: 0,
                    goals: data.goals?.map((goal, index) => ({
                        ...goal,
                        id: `g${Date.now()}_${index}`,
                        rating: 0,
                        progress: 0,
                        status: 'Not Started' as const
                    })) || [],
                    competencies: data.competencies?.map((comp, index) => ({
                        ...comp,
                        id: `c${Date.now()}_${index}`
                    })) || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: data.reviewerId,
                    lastModifiedBy: data.reviewerId
                };

                this.reviews.push(newReview);
                resolve(newReview);
            }, 600);
        });
    }

    // Update performance review
    async updatePerformanceReview(id: string, data: UpdatePerformanceReviewData): Promise<PerformanceReview> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.reviews.findIndex(r => r.id === id);
                if (index === -1) {
                    reject(new Error('Performance review not found'));
                    return;
                }

                const updatedReview = {
                    ...this.reviews[index],
                    ...data,
                    updatedAt: new Date().toISOString(),
                    lastModifiedBy: data.reviewerId || this.reviews[index].lastModifiedBy
                };

                this.reviews[index] = updatedReview;
                resolve(updatedReview);
            }, 600);
        });
    }

    // Delete performance review
    async deletePerformanceReview(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = this.reviews.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.reviews.splice(index, 1);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 400);
        });
    }

    // Submit review for approval
    async submitReview(id: string): Promise<PerformanceReview> {
        return this.updatePerformanceReview(id, {
            status: 'In Progress',
            updatedAt: new Date().toISOString()
        });
    }

    // Approve review
    async approveReview(id: string, approverId: string): Promise<PerformanceReview> {
        return this.updatePerformanceReview(id, {
            status: 'Approved',
            completedDate: new Date().toISOString(),
            lastModifiedBy: approverId
        });
    }

    // Publish review
    async publishReview(id: string): Promise<PerformanceReview> {
        return this.updatePerformanceReview(id, {
            status: 'Published',
            updatedAt: new Date().toISOString()
        });
    }
}

export const performanceService = new PerformanceService();