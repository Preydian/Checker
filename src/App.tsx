import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Checker from "./components/checker";

const App: React.FC = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Checker/>}/>
                </Routes>
            </Router>
        </div>
    );
};

export default App;
