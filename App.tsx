import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import ApiDocsPage from "./pages/ApiDocsPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<ApiDocsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
