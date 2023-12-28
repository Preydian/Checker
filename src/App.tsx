// Install necessary dependencies:
// npm install axios react-router-dom

import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import Checker from "./components/checker";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Checker/>}/>
                {/* Add other routes for your application */}
            </Routes>
        </Router>
    );
};

export default App;
