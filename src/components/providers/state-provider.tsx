'use client';

import { Provider } from 'jotai';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider>
            {children}
        </Provider>
    )
}
