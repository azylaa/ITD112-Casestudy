import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContextProvider } from './context/ToastContextProvider'; 

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Residents from "./components/Residents";
import Dashboard from "./components/Dashboard";
import AddDisaster from "./components/Add-Disaster"; 

import { motion } from 'framer-motion';
import "./App.css";
import Minlogo from './pic/logo-min.png'

function App() {
  
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    // Check localStorage to persist the minimized state
    const storedState = JSON.parse(localStorage.getItem("sidebarState"));
    return storedState !== null ? storedState : false; // Default to false if no state in localStorage
  });

  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the logo animation after 3 seconds
    const timer = setTimeout(() => setShowLogo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.onload = () => {
      setTimeout(() => setLoading(false), 1000); // Fade-out delay
    };
  }, []);
  

  return (
    <div className="app">
      {/*{showLogo ? (
        <motion.div
        className="loading-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 4, ease: "easeInOut" }}
      >
        <motion.img 
          src={Minlogo} 
          alt="Logo"
          initial={{rotate: 0, opacity: 1}}
          animate={{ rotate: 360, opacity: 0}}
          transition={{ duration: 4, ease: "easeInOut"}}
          className="loading-logo"
        />
      </motion.div>
      ) : (*/}

          {loading && (
            <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
              <div className="spinner"></div>
            </div>
          )}

      
          <ToastContextProvider> 
            <Router>
              <Sidebar
                  isMinimized={isSidebarMinimized}
                  setIsMinimized={setIsSidebarMinimized}
              /> 
              <div className={`main-content ${isSidebarMinimized ? "adjusted" : ""}`}>
               <Navbar isSidebarMinimized={isSidebarMinimized}/>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />}/>
                  <Route path="/residents" element={<Residents />} />
                  <Route path="/dashboard/add-disaster" element={<AddDisaster />}/> 
                </Routes>
              </div>
            </Router>
          </ToastContextProvider>
        {/* )} */}
    </div>
  );
}

export default App;
