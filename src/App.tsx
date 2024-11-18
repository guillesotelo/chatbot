import { Chat } from "./pages/Chat";
import { AppProvider } from './AppContext';
import './sass/app.scss'
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AppProvider>
      <ToastContainer/>
      <Chat />
    </AppProvider>
  );
}

export default App;
