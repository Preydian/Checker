// Install necessary dependencies:
// npm install axios react-router-dom

import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import axios from 'axios';

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
                client_secret: 'YOUR_CLIENT_SECRET',
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: 'YOUR_CALLBACK_URL',
            };

            axios
                .post(tokenUrl, null, { params: tokenParams })
                .then(response => {
                    const accessToken = response.data.access_token;
                    // Save the access token in your application state or use it as needed
                    console.log('Access Token:', accessToken);
                })
                .catch(error => {
                    console.error('Error getting access token:', error);
                });
        }
    }, [location.search]);

    return <div>Processing...</div>;
};

const BungieOAuth: React.FC = () => {
    // Step 4: Redirect user to Bungie.net authorization URL
    const authUrl = `https://www.bungie.net/en/oauth/authorize?client_id=45985&response_type=code`;

    return (
        <div>
            <p>Welcome to Bungie OAuth</p>
            <a href={authUrl}>Login with Bungie</a>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" Component={BungieOAuth} />
                <Route path="/oauth/callback" Component={BungieOAuthCallback} />
                {/* Add other routes for your application */}
            </Routes>
        </Router>
    );
};

export default App;
