export const PHASES = {
    1: 'Phase 1 MVP',
    2: 'Phase 2',
    3: 'Phase 3'
} as const;

export type Phase = keyof typeof PHASES;

export const getCurrentPhase = (): Phase => {
    return parseInt(process.env.NEXT_PUBLIC_APP_PHASE || '1') as Phase;
};

// Define allowed routes for each phase
export const PHASE_ROUTES: Record<Phase, string[]> = {
    1: [
        // Auth Pages
        '/',
        '/auth/login',
        '/auth/mfa',

        // Main
        '/dashboard',

        // Work
        '/work/projects',
        '/work/tasks',
        '/work/minutes',
        '/work/problems',
        '/work/job-descriptions',
        '/work/departmental-frameworks',
        '/work/departments',

        // People
        '/people/attendance',
        '/people/leave',
        '/people/performance',
        '/people/warnings',
        '/people/lifecycle-management',
        '/people/employees',
        '/people/onboarding-test', // Test page for API exploration
        '/people/onboarding', // Employee onboarding pages

        // Money
        '/money/cashbook',
        '/money/requests',

        // Strategy
        '/strategy/goals',
        '/strategy/journal',
        '/strategy/entities',
        '/strategy/organigram',

        // Resources
        '/resources',

        // Settings
        '/settings',

        // Profile
        '/profile',

        // Other
        '/other/passwords'
    ],
    2: [
        // Phase 1 routes plus Phase 2
        '/dashboard',
        '/work/projects',
        '/work/tasks',
        '/work/minutes',
        '/work/problems',
        '/work/job-descriptions',
        '/work/departmental-frameworks',
        '/people/attendance',
        '/people/leave',
        '/people/performance',
        '/money/cashbook',
        '/people/lifecycle-management',
        '/money/requests',
        '/strategy/goals',
        '/strategy/journal',
        '/strategy/entities',
        '/strategy/organigram',
        '/resources',
        '/resources',
        '/settings',
        '/other/passwords',

        // Phase 2 routes
        '/community/feed',
        '/community/recognition',
        '/chats',
        '/time'
    ],
    3: [
        // All routes from previous phases plus Phase 3
        '/dashboard',
        '/work/projects',
        '/work/tasks',
        '/work/minutes',
        '/work/problems',
        '/work/job-descriptions',
        '/work/departmental-frameworks',
        '/people/attendance',
        '/people/leave',
        '/people/performance',
        '/money/cashbook',
        '/people/lifecycle-management',
        '/money/requests',
        '/strategy/goals',
        '/strategy/journal',
        '/strategy/entities',
        '/strategy/organigram',
        '/resources',
        '/settings',
        '/other/passwords',
        '/community/feed',
        '/community/recognition',
        '/chats',
        '/time'
        // Note: Phase 3 specific routes would be added here when defined
    ]
};

export const isRouteAllowed = (pathname: string, phase: Phase): boolean => {
    const allowedRoutes = PHASE_ROUTES[phase];

    // Exact match
    if (allowedRoutes.includes(pathname)) {
        return true;
    }

    // Dynamic routes match (e.g., /work/projects/123 matches /work/projects)
    for (const route of allowedRoutes) {
        if (pathname.startsWith(route + '/')) {
            return true;
        }
    }

    return false;
};

export const getPhaseDescription = (phase: Phase): string => {
    const descriptions = {
        1: 'Phase 1 focuses on core business operations including organization structure, goals management, cash management, employee profiles, performance tracking, and essential work management systems.',
        2: 'Phase 2 enhances collaboration with community features, chat systems, onboarding processes, and recognition systems to improve team engagement and communication.',
        3: 'Phase 3 introduces advanced features like employee feedback systems, innovation hubs, dispute resolution, and comprehensive event management for organizational excellence.'
    };

    return descriptions[phase];
};

export const getNextPhaseRoutes = (currentPhase: Phase): string[] => {
    const nextPhase = (currentPhase + 1) as Phase;
    if (nextPhase > 3) return [];

    const currentRoutes = PHASE_ROUTES[currentPhase];
    const nextRoutes = PHASE_ROUTES[nextPhase];

    return nextRoutes.filter(route => !currentRoutes.includes(route));
};