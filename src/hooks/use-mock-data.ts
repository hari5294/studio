
'use client';

import { useContext } from 'react';
import { MockDataContext } from '@/lib/mock-data';

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
