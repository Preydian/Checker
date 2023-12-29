interface DisplayProperties {
    description: string;
    name: string;
    icon: string;
    hasIcon: boolean;
}

interface ActivityMode {
    displayProperties: DisplayProperties;
    pgcrImage: string;
    modeType: number;
    activityModeCategory: number;
    isTeamBased: boolean;
    tier: number;
    isAggregateMode: boolean;
    friendlyName: string;
    supportsFeedFiltering: boolean;
    display: boolean;
    order: number;
    hash: number;
    index: number;
    redacted: boolean;
    blacklisted: boolean;
    parentHashes?: number[];
}

type ActivityModes = Record<string, ActivityMode>;