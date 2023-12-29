type bungieNetUser = {
    about: string,
    cachedBungieGlobalDisplayName: string,
    cachedBungieGlobalDisplayNameCode: number,
    displayName: string,
    egsDisplayName: string,
    membershipId: string,
    showActivity: boolean,
    uniqueName: string,
    xboxDisplayName: string
    steamDisplayName: string,
    psnDisplayName: string
    blizzardDisplayName: string
    stadiaDisplayName: string
}

type memberships = {
    LastSeenDisplayName: string,
    LastSeenDisplayNameType: string,
    bungieGlobalDisplayName: string,
    bungieGlobalDisplayNameCode: number,
    crossSaveOverride: number,
    displayName: string,
    membershipId: string,
    membershipType: string,
}

type membershipData = {
    bungieNetUser: bungieNetUser,
    destinyMemberships: Array<memberships>,
    primaryMembershipId: string
}