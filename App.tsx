import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ScrapePage } from "./pages/ScrapePage";
import { CleanPage } from "./pages/CleanPage";
import ApiDocsPage from "./pages/ApiDocsPage";
import TestPage from "./pages/TestPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scrape" element={<ScrapePage />} />
        <Route path="/clean" element={<CleanPage />} />
        <Route path="/docs" element={<ApiDocsPage />} />
        {import.meta.env.DEV && <Route path="/test" element={<TestPage />} />}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
