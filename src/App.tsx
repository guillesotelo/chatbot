import { Chat } from "./pages/Chat";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import './sass/app.scss'
import Admin from "./pages/Admin";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ReactGA from 'react-ga4'
import { useEffect } from "react";
import { useReactPath } from "./hooks/useReactPath";

function App() {
  const path = useReactPath()

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname
    })
  }, [path, window.location.pathname])

  return (
    <BrowserRouter>
      {/* <GoogleAnalytics /> */}
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
