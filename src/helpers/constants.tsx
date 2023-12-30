/**
 * Used to grab the JSON manifest files that hold all the information about the Destiny 2 game
 */
const baseManifestUrl = "https://www.bungie.net/"

/**
 * The root url for the api
 * Used when grabbing protected resources
 */
const apiRoot = "https://www.bungie.net/Platform"

/**
 * The root url for oAuth calls
 * Used to generate access tokens and membershipIDs
 */
const tokenUrl = 'https://www.bungie.net/Platform/App/Oauth/Token/';

export {baseManifestUrl, apiRoot, tokenUrl}