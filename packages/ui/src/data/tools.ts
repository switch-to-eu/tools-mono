export interface Tool {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'beta' | 'coming-soon';
    color: string;
    icon?: string;
    tagline?: string;
    description?: string;
}

export const tools: Tool[] = [
    {
        id: 'plotty',
        name: 'Plotty',
        url: 'https://plotty.eu',
        status: 'active',
        color: 'blue',
        icon: 'calendar'
    },
    {
        id: 'nully',
        name: 'Nully',
        url: 'https://nully.eu',
        status: 'active',
        color: 'green',
        icon: 'upload'
    },
    {
        id: 'keepfocus',
        name: 'KeepFocus',
        url: 'https://keepfocus.eu',
        status: 'active',
        color: 'purple',
        icon: 'target'
    }
];

export const getToolById = (id: string): Tool | undefined => {
    return tools.find(tool => tool.id === id);
};

export const getActiveTools = (): Tool[] => {
    return tools.filter(tool => tool.status === 'active');
};

export const getToolsByStatus = (status: Tool['status']): Tool[] => {
    return tools.filter(tool => tool.status === status);
};
