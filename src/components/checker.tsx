import axios from 'axios';
import React from "react";
import {useLocation} from "react-router-dom";


const Checker = () => {

    const baseManifestUrl = "https://www.bungie.net/"
    const apiRoot = "https://www.bungie.net/Platform"
    const authUrl = `https://www.bungie.net/en/oauth/authorize?client_id=45985&response_type=code`;
    const location = useLocation();

    const [primaryMembershipId, setPrimaryMembershipId] = React.useState("")
    const [activityModeManifest, setActivityModeManifest] = React.useState<ActivityModes>()
    const [primaryMembershipType, setPrimaryMembershipType] = React.useState("")
    const [currentActivity, setCurrentActivity] = React.useState("")
    const [activityHash, setActivityHash] = React.useState<number>()
    const [activityModeHash, setActivityModeHash] = React.useState<number>()
    const [userData, setUserData] = React.useState<membershipData>()
    const [activityData, setActivityData] = React.useState<activitiesComponent>()

    React.useEffect(() => {

        const urlSearchParams = new URLSearchParams(location.search);
        const authorizationCode = urlSearchParams.get('code');

        if (authorizationCode) {

            const tokenUrl = 'https://www.bungie.net/Platform/App/Oauth/Token/';
            const body = new URLSearchParams({
                grant_type: "authorization_code",
                code: authorizationCode,
                client_id: "45985",
                client_secret: "6siat6XMy81e.SF4ODpsot78zfI9G5zfG9npwAaJjK4"
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

                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }
    }, [location.search]);

    React.useEffect(() => {
        let bungieMembershipId = localStorage.getItem("bungieMembershipId")

        if (bungieMembershipId !== null) {
            axios.get(`${apiRoot}/User/GetMembershipsById/${bungieMembershipId}/${254}/`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-Key': 'dcf079d10b534c00b8b9f772a1503dd9'
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

    React.useEffect(() => {

        if (userData !== undefined) {
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

    React.useEffect(() => {

        if (primaryMembershipId !== "") {
            axios.get(`${apiRoot}/Destiny2/${primaryMembershipType}/Profile/${primaryMembershipId}/?components=204`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-Key': 'dcf079d10b534c00b8b9f772a1503dd9',
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                }
            })
                .then(response => {

                    setActivityData(response.data["Response"])
                    console.log(response.data["Response"])

                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }

    }, [primaryMembershipId])

    React.useEffect(() => {

        if (activityData !== undefined) {
            for (let key in activityData.characterActivities.data) {
                let currentCharacterActivity = activityData.characterActivities.data[key]
                if (currentCharacterActivity.currentActivityHash !== 0) {

                    setActivityHash(currentCharacterActivity.currentActivityHash)
                    setActivityModeHash(currentCharacterActivity.currentActivityModeHash)

                    break
                }
            }
        }

    }, [activityData])

    React.useEffect(() => {

        axios.get(`${baseManifestUrl}/common/destiny2_content/json/en/DestinyActivityModeDefinition-a160e00f-0743-4edb-a4d6-86452656ed54.json`)
            .then(response => {

                setActivityModeManifest(response.data)

            })
            .catch(error => {
                console.error('Error getting access token:', error);
            });

    }, [activityModeHash])

    React.useEffect(() => {

        if (activityModeManifest !== undefined && activityModeHash !== undefined) {

            if (activityModeManifest[activityModeHash] !== undefined) {

                console.log(`Playing ${activityModeManifest[activityModeHash].friendlyName}`)
                setCurrentActivity(activityModeManifest[activityModeHash].friendlyName)
                showNotification()
            }
        }

    }, [activityModeManifest])


    const showNotification = () => {
        if (Notification.permission === 'granted') {
            // If permission is granted, create and show the notification
            const notification = new Notification('My Notification', {
                body: 'You have a game!!',
            });

            // You can also add event listeners to handle user interaction with the notification
            notification.onclick = () => {
                console.log('Notification clicked!');
            };
        } else if (Notification.permission !== 'denied') {
            // If permission is not denied, request permission from the user
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification();
                }
            });
        }
    };

    return (
        <div>
            <p>Welcome to Bungie OAuth</p>
            <a href={authUrl}>Login with Bungie</a>
            <p>Bungie Membership ID: {localStorage.getItem("bungieMembershipId")}</p>
            <p>Primary Membership ID: {primaryMembershipId}</p>
            <p>Primary Membership Type: {primaryMembershipType}</p>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <strong style={{marginRight: '8px'}}>Playing:</strong>
                <div>{currentActivity}</div>
            </div>
        </div>
    );
}

export default Checker;