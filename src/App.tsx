import { Chat } from "./pages/Chat";
import { AppProvider } from './AppContext';
import './sass/app.scss'

function App() {
  return (
    <AppProvider>
      <Chat />
    </AppProvider>
  );
}

export default App;
