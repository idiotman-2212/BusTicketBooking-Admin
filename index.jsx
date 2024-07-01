import React from "react";
import ReactDOM from "react-dom/client";
import App from "./src/App.jsx";
import "./src/index.css";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log("EEEEEEEEEEEEEEEEEE")
root.render(
  <BrowserRouter >
  
    
    <App  />
  </BrowserRouter>
);