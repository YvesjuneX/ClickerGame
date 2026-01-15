import { UserProvider, useUser } from './context/UserContext';
import Auth from './pages/Auth';
import Game from './pages/Game';
import './App.css';

const Main = () => {
  const { user } = useUser();

  return (
    <div className="app-container">
      {user ? <Game /> : <Auth />}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <Main />
    </UserProvider>
  );
}

export default App;
