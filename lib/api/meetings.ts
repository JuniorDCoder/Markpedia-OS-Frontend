import { apiRequest } from './client';
import { normalizeListResponse } from './normalize';
import { Meeting, MeetingConfig, Decision, ActionItem, AgendaItem, DiscussionItem, RiskItem } from '@/types';

// Backend types (snake_case)
export type BackendMeeting = {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    platform: string;
    location: string;
    department: string[];
    meeting_type: string;
    called_by: string;
    facilitator: string;
    minute_taker: string;
    participants: string[];
    absent: string[];
    status: string;

    // Structured sections
    purpose: string;
    agenda: BackendAgendaItem[];
    discussion: BackendDiscussionItem[];
    decisions: BackendDecision[];
    action_items: BackendActionItem[];
    risks: BackendRiskItem[];
    attachments: string[];

    created_by: string;
    created_at: string;
    updated_at: string;
};

export type BackendAgendaItem = {
    id: string;
    topic: string;
    presenter: string;
    duration: string;
    notes?: string;
};

export type BackendDiscussionItem = {
    id: string;
    topic: string;
    speaker: string;
    points: string[];
    timestamp?: string;
};

export type BackendDecision = {
    id: string;
    topic: string;
    decision: string;
    rationale?: string;
    voted: string[];
    opposed: string[];
    abstained: string[];
};

export type BackendActionItem = {
    id: string;
    item: string;
    owner: string;
    due_date: string;
    status: string;
    priority: string;
};

export type BackendRiskItem = {
    id: string;
    risk: string;
    impact: string;
    likelihood: string;
    mitigation: string;
    owner: string;
};

export type BackendMeetingCreate = Omit<BackendMeeting, 'id' | 'created_at' | 'updated_at'>;
export type BackendMeetingUpdate = Partial<BackendMeetingCreate>;

export type BackendMeetingConfig = {
    id: string;
    notifications: {
        before_meeting: boolean;
        before_meeting_time: number;
        after_meeting: boolean;
        action_items_due: boolean;
        decision_follow_up: boolean;
    };
    automation: {
        auto_create_tasks: boolean;
        task_priority: string;
        default_assignee: string;
        sync_with_calendar: boolean;
    };
    templates: {
        default_template: string;
        custom_templates: string[];
    };
};

// Mapping functions
export function mapBackendMeeting(m: BackendMeeting): Meeting {
    return {
        id: m.id,
        title: m.title,
        date: m.date,
        startTime: m.start_time,
        endTime: m.end_time,
        platform: m.platform,
        location: m.location,
        department: m.department,
        meetingType: m.meeting_type,
        calledBy: m.called_by,
        facilitator: m.facilitator,
        minuteTaker: m.minute_taker,
        participants: m.participants,
        absent: m.absent,
        status: m.status as Meeting['status'],

        purpose: m.purpose,
        agenda: m.agenda?.map(mapBackendAgendaItem) || [],
        discussion: m.discussion?.map(mapBackendDiscussionItem) || [],
        decisions: m.decisions?.map(mapBackendDecision) || [],
        actionItems: m.action_items?.map(mapBackendActionItem) || [],
        risks: m.risks?.map(mapBackendRiskItem) || [],
        attachments: m.attachments || [],

        createdBy: m.created_by,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
    };
}

export function mapBackendAgendaItem(a: BackendAgendaItem): AgendaItem {
    return {
        id: a.id,
        topic: a.topic,
        presenter: a.presenter,
        duration: a.duration,
        notes: a.notes,
    };
}

export function mapBackendDiscussionItem(d: BackendDiscussionItem): DiscussionItem {
    return {
        id: d.id,
        topic: d.topic,
        speaker: d.speaker,
        points: d.points,
        timestamp: d.timestamp,
    };
}

export function mapBackendDecision(d: BackendDecision): Decision {
    return {
        id: d.id,
        topic: d.topic,
        decision: d.decision,
        rationale: d.rationale,
        voted: d.voted,
        opposed: d.opposed,
        abstained: d.abstained,
    };
}

export function mapBackendActionItem(a: BackendActionItem): ActionItem {
    return {
        id: a.id,
        item: a.item,
        owner: a.owner,
        dueDate: a.due_date,
        status: a.status as ActionItem['status'],
        priority: a.priority as ActionItem['priority'],
    };
}

export function mapBackendRiskItem(r: BackendRiskItem): RiskItem {
    return {
        id: r.id,
        risk: r.risk,
        impact: r.impact as RiskItem['impact'],
        likelihood: r.likelihood as RiskItem['likelihood'],
        mitigation: r.mitigation,
        owner: r.owner,
    };
}

export function mapBackendMeetingConfig(c: BackendMeetingConfig): MeetingConfig {
    return {
        id: c.id,
        notifications: {
            beforeMeeting: c.notifications.before_meeting,
            beforeMeetingTime: c.notifications.before_meeting_time,
            afterMeeting: c.notifications.after_meeting,
            actionItemsDue: c.notifications.action_items_due,
            decisionFollowUp: c.notifications.decision_follow_up,
        },
        automation: {
            autoCreateTasks: c.automation.auto_create_tasks,
            taskPriority: c.automation.task_priority,
            defaultAssignee: c.automation.default_assignee,
            syncWithCalendar: c.automation.sync_with_calendar,
        },
        templates: {
            defaultTemplate: c.templates.default_template,
            customTemplates: c.templates.custom_templates,
        },
    };
}

// Frontend to Backend mapping
export function mapFrontendToBackendMeetingCreate(m: Partial<Meeting>): BackendMeetingCreate {
    return {
        title: m.title || '',
        date: m.date || new Date().toISOString().split('T')[0],
        start_time: m.startTime || '09:00',
        end_time: m.endTime || '10:00',
        platform: m.platform || '',
        location: m.location || '',
        department: m.department || [],
        meeting_type: m.meetingType || '',
        called_by: m.calledBy || '',
        facilitator: m.facilitator || '',
        minute_taker: m.minuteTaker || '',
        participants: m.participants || [],
        absent: m.absent || [],
        status: (m.status as any) || 'Scheduled',

        purpose: m.purpose || '',
        agenda: m.agenda?.map(mapFrontendToBackendAgendaItem) || [],
        discussion: m.discussion?.map(mapFrontendToBackendDiscussionItem) || [],
        decisions: m.decisions?.map(mapFrontendToBackendDecision) || [],
        action_items: m.actionItems?.map(mapFrontendToBackendActionItem) || [],
        risks: m.risks?.map(mapFrontendToBackendRiskItem) || [],
        attachments: m.attachments || [],

        created_by: m.createdBy || '',
    };
}

export function mapFrontendToBackendMeetingUpdate(m: Partial<Meeting>): BackendMeetingUpdate {
    const payload: BackendMeetingUpdate = {};

    if (m.title !== undefined) payload.title = m.title;
    if (m.date !== undefined) payload.date = m.date;
    if (m.startTime !== undefined) payload.start_time = m.startTime;
    if (m.endTime !== undefined) payload.end_time = m.endTime;
    if (m.platform !== undefined) payload.platform = m.platform;
    if (m.location !== undefined) payload.location = m.location;
    if (m.department !== undefined) payload.department = m.department;
    if (m.meetingType !== undefined) payload.meeting_type = m.meetingType;
    if (m.calledBy !== undefined) payload.called_by = m.calledBy;
    if (m.facilitator !== undefined) payload.facilitator = m.facilitator;
    if (m.minuteTaker !== undefined) payload.minute_taker = m.minuteTaker;
    if (m.participants !== undefined) payload.participants = m.participants;
    if (m.absent !== undefined) payload.absent = m.absent;
    if (m.status !== undefined) payload.status = m.status as any;
    if (m.purpose !== undefined) payload.purpose = m.purpose;
    if (m.agenda !== undefined) payload.agenda = m.agenda?.map(mapFrontendToBackendAgendaItem) || [];
    if (m.discussion !== undefined) payload.discussion = m.discussion?.map(mapFrontendToBackendDiscussionItem) || [];
    if (m.decisions !== undefined) payload.decisions = m.decisions?.map(mapFrontendToBackendDecision) || [];
    if (m.actionItems !== undefined) payload.action_items = m.actionItems?.map(mapFrontendToBackendActionItem) || [];
    if (m.risks !== undefined) payload.risks = m.risks?.map(mapFrontendToBackendRiskItem) || [];
    if (m.attachments !== undefined) payload.attachments = m.attachments || [];

    return payload;
}

// Helper mapping functions for sub-items
export function mapFrontendToBackendAgendaItem(a: AgendaItem): BackendAgendaItem {
    return {
        id: a.id,
        topic: a.topic,
        presenter: a.presenter,
        duration: a.duration,
        notes: a.notes,
    };
}

export function mapFrontendToBackendDiscussionItem(d: DiscussionItem): BackendDiscussionItem {
    return {
        id: d.id,
        topic: d.topic,
        speaker: d.speaker,
        points: d.points,
        timestamp: d.timestamp,
    };
}

export function mapFrontendToBackendDecision(d: Decision): BackendDecision {
    return {
        id: d.id,
        topic: d.topic,
        decision: d.decision,
        rationale: d.rationale,
        voted: d.voted,
        opposed: d.opposed,
        abstained: d.abstained,
    };
}

export function mapFrontendToBackendActionItem(a: ActionItem): BackendActionItem {
    return {
        id: a.id,
        item: a.item,
        owner: a.owner,
        due_date: a.dueDate,
        status: a.status,
        priority: a.priority,
    };
}

export function mapFrontendToBackendRiskItem(r: RiskItem): BackendRiskItem {
    return {
        id: r.id,
        risk: r.risk,
        impact: r.impact,
        likelihood: r.likelihood,
        mitigation: r.mitigation,
        owner: r.owner,
    };
}

export function mapFrontendToBackendMeetingConfig(c: MeetingConfig): BackendMeetingConfig {
    return {
        id: c.id,
        notifications: {
            before_meeting: c.notifications.beforeMeeting,
            before_meeting_time: c.notifications.beforeMeetingTime,
            after_meeting: c.notifications.afterMeeting,
            action_items_due: c.notifications.actionItemsDue,
            decision_follow_up: c.notifications.decisionFollowUp,
        },
        automation: {
            auto_create_tasks: c.automation.autoCreateTasks,
            task_priority: c.automation.taskPriority,
            default_assignee: c.automation.defaultAssignee,
            sync_with_calendar: c.automation.syncWithCalendar,
        },
        templates: {
            default_template: c.templates.defaultTemplate,
            custom_templates: c.templates.customTemplates,
        },
    };
}

// API parameter types
export type ListMeetingsParams = {
    skip?: number;
    limit?: number;
    status?: string | null;
    department?: string | null;
    search?: string | null;
};

// Query builder utility
function buildQuery(params: Record<string, any>) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined) return;
        if (v === null) {
            q.append(k, '');
        } else {
            q.append(k, String(v));
        }
    });
    const s = q.toString();
    return s ? `?${s}` : '';
}

// API methods
export const meetingsApi = {
    async list(params: ListMeetingsParams = {}) {
        const { skip = 0, limit = 100, ...filters } = params;
        const query = buildQuery({ skip, limit, ...filters });
        const data = await apiRequest(`/work/meetings/${query}`);
        const normalized = normalizeListResponse<BackendMeeting>(data);
        return {
            meetings: (normalized.items || []).map(mapBackendMeeting),
            total: normalized.total
        };
    },

    async getById(id: string) {
        const data = await apiRequest<BackendMeeting>(`work/meetings/${id}`);
        return mapBackendMeeting(data);
    },

    async create(meeting: Partial<Meeting>) {
        const payload = mapFrontendToBackendMeetingCreate(meeting);
        const data = await apiRequest<BackendMeeting>(`/work/meetings/`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapBackendMeeting(data);
    },

    async update(id: string, updates: Partial<Meeting>) {
        const payload = mapFrontendToBackendMeetingUpdate(updates);
        const data = await apiRequest<BackendMeeting>(`/work/meetings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return mapBackendMeeting(data);
    },

    async remove(id: string) {
        await apiRequest<void>(`/work/meetings/${id}`, {
            method: 'DELETE'
        });
    },

    async addDecision(meetingId: string, decision: Decision) {
        const payload = mapFrontendToBackendDecision(decision);
        const data = await apiRequest<BackendMeeting>(`/work/meetings/${meetingId}/decisions`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapBackendMeeting(data);
    },

    async addActionItem(meetingId: string, actionItem: ActionItem) {
        const payload = mapFrontendToBackendActionItem(actionItem);
        const data = await apiRequest<BackendMeeting>(`/work/meetings/${meetingId}/action-items`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapBackendMeeting(data);
    },

    async updateActionItemStatus(meetingId: string, itemId: string, status: string) {
        const data = await apiRequest<BackendMeeting>(`/work/meetings/${meetingId}/action-items/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return mapBackendMeeting(data);
    },

    async getConfig() {
        const data = await apiRequest<BackendMeetingConfig>(`/work/meetings/config/default`);
        return mapBackendMeetingConfig(data);
    },

    async saveConfig(config: MeetingConfig) {
        const payload = mapFrontendToBackendMeetingConfig(config);
        await apiRequest<void>(`/work/meetings/config/default`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    async getStats() {
        return apiRequest<any>(`/work/meetings/stats/overview`);
    },
};