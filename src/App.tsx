import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Checker from "./components/checker";
import './App.css';

const App: React.FC = () => {
    return (
        <div id="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Checker/>}/>
                </Routes>
            </Router>
        </div>
    );
};

export default App;
