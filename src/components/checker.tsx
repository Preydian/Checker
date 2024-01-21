import axios from 'axios';
import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {showNotification} from "../helpers/notification";
import {apiRoot, baseManifestUrl, tokenUrl} from "../helpers/constants";
import {formatTime} from "../helpers/format";


const Checker = () => {


    const location = useLocation();
    const navigate = useNavigate()
    const [timeLeft, setTimeLeft] = React.useState<number>(sessionStorage.getItem("timeLeft") == null ? 600 : Number(sessionStorage.getItem("timeLeft")));
    const [matchMaking, setMatchMaking] = React.useState<boolean>(sessionStorage.getItem("matchMaking") == "true");

    const [primaryMembershipId, setPrimaryMembershipId] = React.useState("")
    const [primaryMembershipType, setPrimaryMembershipType] = React.useState("")
    const [currentActivity, setCurrentActivity] = React.useState("")
    const [newClient, setNewClient] = React.useState<boolean>(true)

    const [activityModeManifestLink, setActivityModeManifestLink] = React.useState("")
    const [activityModeManifest, setActivityModeManifest] = React.useState<ActivityModes>()
    const [activityHash, setActivityHash] = React.useState<number>()
    const [activityModeHash, setActivityModeHash] = React.useState<number>()
    const [activityTime, setActivityTime] = React.useState<number>(0)

    const [userData, setUserData] = React.useState<membershipData>()
    const [activityData, setActivityData] = React.useState<activitiesComponent>()

    /**
     * Gets the link to the activity mode manifest JSON file
     * Trigger: Initial page launch
     */
    React.useEffect(() => {

        if (activityModeManifestLink == "") {
            axios.get(`${apiRoot}/Destiny2/Manifest/`)
                .then(response => {

                    setActivityModeManifestLink(response.data["Response"]["jsonWorldComponentContentPaths"]["en"]["DestinyActivityModeDefinition"])

                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }
    }, [])

    /**
     * Updates the timer, if timer runs out calls showNotification
     */
    React.useEffect(() => {
        if (!matchMaking) { // If not matchmaking return early
            return
        }
        const timer = setInterval(() => { // Create a 1-second timer interval
            if (timeLeft > 0) {
                setTimeLeft(timeLeft - 1);
                sessionStorage.setItem("timeLeft", String(timeLeft - 1))
            } else if (timeLeft == 0) {
                setMatchMaking(false)
                sessionStorage.setItem("matchMaking", String(false))
                showNotification("Mongoose")
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [matchMaking, timeLeft]);

    /**
     * Handles oAuth authorization
     * Triggers: When URL changes, relies on the 'code' search parameter from the bungie login client
     */
    React.useEffect(() => {

        const urlSearchParams = new URLSearchParams(location.search);
        const authorizationCode = urlSearchParams.get('code');

        if (authorizationCode) {

            const body = new URLSearchParams({
                grant_type: "authorization_code",
                code: authorizationCode,
                client_id: `${process.env.REACT_APP_CLIENT_ID}`,
                client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`
            }).toString()

            axios.post(tokenUrl, body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(response => {

                    localStorage.setItem("accessToken",response.data["access_token"])
                    localStorage.setItem("bungieMembershipId",response.data["membership_id"])
                    localStorage.setItem("refreshToken",response.data["refresh_token"])
                    localStorage.setItem("expiresIn",response.data["expires_in"])

                    const currentTimeMillis: number = new Date().getTime();
                    const currentTimeSeconds: number = Math.floor(currentTimeMillis / 1000)

                    localStorage.setItem("tokenGrantedTime", String(currentTimeSeconds))
                    setNewClient(false)

                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }
    }, [location.search]);

    /**
     * Gets the users data using the membership_id returned after successful oAuth verification
     * Trigger: The accessToken is updated
     */
    React.useEffect(() => {
        let bungieMembershipId = localStorage.getItem("bungieMembershipId")

        if (bungieMembershipId !== null) {
            axios.get(`${apiRoot}/User/GetMembershipsById/${bungieMembershipId}/${254}/`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-Key': process.env.REACT_APP_API_KEY
                }
            })
                .then(response => {

                    setUserData(response.data["Response"])

                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }

    }, [localStorage.getItem("accessToken")])

    /**
     * Finds the users primary/main membership_type (Xbox, PSN, Steam, etc.) and their membership_id
     * Trigger: The userData is updated
     */
    React.useEffect(() => {

        if (userData !== undefined) {
            if (userData.destinyMemberships.length === 1) {
                let currentMembership = userData.destinyMemberships[0]
                setPrimaryMembershipId(currentMembership.membershipId)
                setPrimaryMembershipType(currentMembership.membershipType)
            }
            for (let i = 0; i < userData.destinyMemberships.length; i++) {
                let currentMembership = userData.destinyMemberships[i]
                if (currentMembership.membershipId === userData.primaryMembershipId) {
                    setPrimaryMembershipId(currentMembership.membershipId)
                    setPrimaryMembershipType(currentMembership.membershipType)
                    break
                }
            }
        }

    }, [userData])

    /**
     * Gets the activity data for the current user, runs every 5 seconds
     * Trigger: The primaryMembershipId is updated
     */
    React.useEffect(() => {

        const fetchData = async () => {

            const currentTimeSeconds: number = Math.floor(new Date().getTime() / 1000)

            if (currentTimeSeconds - Number(localStorage.getItem("tokenGrantedTime")) >= (Number(localStorage.getItem("expiresIn")) - 10)) {
                console.log("Refreshing token")
                await refreshToken()
            }

            if (primaryMembershipId !== "") {
                try {
                    const response = await axios.get(`${apiRoot}/Destiny2/${primaryMembershipType}/Profile/${primaryMembershipId}/?components=204`, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-API-Key': process.env.REACT_APP_API_KEY,
                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                        }
                    });

                    console.log(response.data["Response"])

                    setActivityData(response.data["Response"]);

                } catch (error) {
                    console.error('Error getting access token:', error);
                }
            }
        };

        setInterval(fetchData, 5000);

    }, [primaryMembershipId]);

    /**
     * Checks if an activity is being played and extracts the associated hashes
     * Trigger: The users activityData is updated
     */
    React.useEffect(() => {

        if (activityData !== undefined) {
            for (let key in activityData.characterActivities.data) {
                let currentCharacterActivity = activityData.characterActivities.data[key]
                if (currentCharacterActivity.currentActivityHash !== 0) {

                    const unixTimestamp = Date.parse(currentCharacterActivity.dateActivityStarted) / 1000; // Convert milliseconds to seconds

                    setActivityHash(currentCharacterActivity.currentActivityHash)
                    setActivityModeHash(currentCharacterActivity.currentActivityModeHash)
                    setActivityTime(unixTimestamp)

                    break
                }
            }
        }

    }, [activityData])

    /**
     * Gets the activity mode manifest JSON file
     * Trigger: The activityModeHash is updated
     */
    React.useEffect(() => {

        axios.get(`${baseManifestUrl}${activityModeManifestLink}`)
            .then(response => {

                setActivityModeManifest(response.data)

            })
            .catch(error => {
                console.error('Error getting access token:', error);
            });

    }, [activityModeHash])

    /**
     * Checks if a new activity is starting and handles accordingly
     * Trigger: The activityModeManifest is updated
     */
    React.useEffect(() => {

        if (activityModeManifest !== undefined && activityModeHash !== undefined) {
            const currentUnixTime = Math.floor(Date.now() / 1000);

            let notSocialArea = activityModeHash !== 2166136261 && activityModeHash !== 1589650888

            if (activityModeManifest[activityModeHash] !== undefined && Number(sessionStorage.getItem("lastTime")) < activityTime && currentUnixTime - activityTime < 60 && notSocialArea) {

                console.log(`Playing ${activityModeManifest[activityModeHash].friendlyName}`)
                setCurrentActivity(activityModeManifest[activityModeHash].friendlyName)
                sessionStorage.setItem("lastHash", String(activityModeHash))
                showNotification(activityModeManifest[activityModeHash].friendlyName)

            } else if (activityModeHash === 2166136261 && Number(sessionStorage.getItem("lastTime")) <= activityTime && sessionStorage.getItem("lastHash") !== "Orbit") {
                console.log(`In orbit`)
                setCurrentActivity("Orbit")
                sessionStorage.setItem("lastHash", "Orbit")
                showNotification("Orbit")

            } else if (activityModeHash === 1589650888 && Number(sessionStorage.getItem("lastTime")) <= activityTime && sessionStorage.getItem("lastHash") !== "Social") {
                console.log(`In a Social Area`)
                setCurrentActivity("Social")
                sessionStorage.setItem("lastHash", "Social")
                showNotification("Social")
            }

            resetMatchMaking()
            sessionStorage.setItem("lastTime", String(activityTime))

        }

    }, [activityModeManifest])

    /**
     * Refreshes the access token
     */
    const refreshToken = async () => {

        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: String(localStorage.getItem("refreshToken")),
            client_id: `${process.env.REACT_APP_CLIENT_ID}`,
            client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`
        }).toString()

        await axios.post(tokenUrl, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {

                localStorage.setItem("accessToken",response.data["access_token"])
                localStorage.setItem("bungieMembershipId",response.data["membership_id"])
                localStorage.setItem("refreshToken",response.data["refresh_token"])

                const currentTimeSeconds: number = Math.floor(new Date().getTime() / 1000)

                localStorage.setItem("tokenGrantedTime", String(currentTimeSeconds))
                setNewClient(false)

            })
            .catch(error => {
                console.error('Error getting access token:', error);
            });
    }

    /**
     * Redirects the user to the bungie sign in client and removes API information just in case
     */
    const signIn = () => {
        resetMatchMaking()
        sessionStorage.removeItem("lastHash")
        sessionStorage.removeItem("lastTime")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("bungieMembershipId")
        localStorage.removeItem("refreshToken")
        window.location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&reauth=${newClient}`
    }

    /**
     * Signs the user out by removing the required API information
     */
    const signOut = () => {
        setNewClient(true)
        resetMatchMaking()
        sessionStorage.removeItem("lastHash")
        sessionStorage.removeItem("lastTime")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("bungieMembershipId")
        localStorage.removeItem("refreshToken")
        navigate("/")
        window.location.reload()
    }

    /**
     * Toggles the match making state
     * Used for buttons and to stop the timer
     */
    const toggleMatchMaking = () => {
        setTimeLeft(600)
        setMatchMaking(!matchMaking)
        sessionStorage.setItem("matchMaking", String(!matchMaking))
        sessionStorage.setItem("timeLeft", String(600))

    }

    /**
     * Resets the matchmaking variables
     * Used for buttons and to stop the timer
     */
    const resetMatchMaking = () => {
        setMatchMaking(false)
        sessionStorage.setItem("matchMaking", String(false))
        sessionStorage.setItem("timeLeft", String(600))
        setTimeLeft(600)
    }

    return (
        <div>
            <h2 className="description d-flex align-content-center justify-content-center">
                Welcome to Destiny Queue Checker
            </h2>
            <p className="description">
                How it works
            </p>
            <ol className="description">
                <li>
                    Login
                </li>
                <li>
                    Allow notifications
                </li>
                <li>
                    Leave the tab running in the background
                </li>
            </ol>
            <p className="description">
                When you change activity you will receive a notification telling you what activity is about to start.
                <br/>
                You will receive the first notification relatively quickly, this will be for your current activity.
            </p>
            <div className="btn btn-primary m-2" role="button" onClick={() => signIn()}>
                Login with Bungie
            </div>
            <div className="btn btn-danger m-2" role="button" onClick={() => signOut()}>
                Sign Out
            </div>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <strong className="description" style={{marginRight: '8px'}}>
                    Display Name:
                </strong>
                <div className="description">
                    {userData?.bungieNetUser.displayName}
                </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <strong className="description" style={{marginRight: '8px'}}>
                    Activity:
                </strong>
                <div className="description">
                    {currentActivity}
                </div>
            </div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card text-center">
                            <div className="card-header">Time until Mongoose Error Code</div>
                            <div className="card-body">
                                <h1>{formatTime(timeLeft)}</h1>
                            </div>
                            <div className="card-footer">
                                {matchMaking &&
                                    <div className="btn btn-warning m-2" role="button" onClick={() => toggleMatchMaking()}>
                                        Stopped Matchmaking
                                    </div>
                                }
                                {!matchMaking &&
                                    <div className="btn btn-info m-2" role="button" onClick={() => toggleMatchMaking()}>
                                        Started Matchmaking
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Checker;