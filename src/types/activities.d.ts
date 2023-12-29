type activitiesComponent = {
    responseMintedTimestamp: number,
    secondaryComponentsMintedTimestamp: number,
    characterActivities: characterActivities
}

type characterActivities = {
    privacy: number
    data: Array<activities>
}

type activities = {
    currentActivityHash: number,
    currentActivityModeHash: number,
    currentPlaylistActivityHash: number,
    dateActivityStarted: string,
    currentActivityModeType: number
}