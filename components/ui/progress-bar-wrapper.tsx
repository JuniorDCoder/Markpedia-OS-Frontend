'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Import nprogress CSS
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
    showSpinner: true,
    trickleSpeed: 500,
    minimum: 0.3,
});

export default function ProgressBarWrapper() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.start();
        NProgress.done();
    }, [pathname, searchParams]);

    useEffect(() => {
        // Custom CSS for the progress bar
        const style = document.createElement('style');
        style.textContent = `
      #nprogress .bar {
        background: #fffd00 !important;
        height: 4px !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px #fffd00, 0 0 5px #fffd00 !important;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return null;
}