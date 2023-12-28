import axios from 'axios';
import React, {useEffect} from "react";
import {useLocation} from "react-router-dom";


const Checker = () => {

    const [authCode, setAuthCode] = React.useState("First")

    const BungieOAuthCallback: React.FC = () => {
        const location = useLocation();

        useEffect(() => {
            // Extract the authorization code from the query parameters
            const urlSearchParams = new URLSearchParams(location.search);
            const authorizationCode = urlSearchParams.get('code');

            if (authorizationCode) {
                // Exchange authorization code for access token
                const tokenUrl = 'https://www.bungie.net/platform/app/oauth/token/';
                const tokenParams = {
                    client_id: '45985',
                    client_secret: '6siat6XMy81e.SF4ODpsot78zfI9G5zfG9npwAaJjK4',
                    code: authorizationCode,
                    grant_type: 'authorization_code',
                    redirect_uri: 'https://destinyqueuechecker.bot.nu/',
                };

                axios
                    .post(tokenUrl, null, { params: tokenParams })
                    .then(response => {
                        const accessToken = response.data.access_token;
                        // Save the access token in your application state or use it as needed
                        console.log('Access Token:', accessToken);
                        setAuthCode(response.data)
                    })
                    .catch(error => {
                        console.error('Error getting access token:', error);
                    });
            }
        }, [location.search]);

        return <div>Processing...</div>;
    };

    const authUrl = `https://www.bungie.net/en/oauth/authorize?client_id=45985&response_type=code`;


    return (
        <div>
            <p>Welcome to Bungie OAuth</p>
            <a href={authUrl}>Login with Bungie</a>
            <p>{authCode}</p>
        </div>
    );
}

export default Checker;