import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import { Route, Routes } from "react-router-dom";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import PrivateRoute from "./components/private_route";
import Login from "./pages/LoginPage";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<LandingPage />} />
        <Route path="/login" element= {<Login/>}/>
        <Route path="/questionnaire" element={ <PrivateRoute>  <Questionnaire /> </PrivateRoute>} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </>
  );
}

export default App;
