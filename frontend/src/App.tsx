import "./App.css";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./contexts/AuthContext";

const App: React.FC = () => {
  const { user, isLoading, logout } = useAuth(); // use context instead of manual state

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500 mb-4" />
        <p className="text-xl">Loading Application...</p>
      </div>
    );
  }

  return (
    <div className="app-container h-full w-full">
      {user ? <ChatPage /> : <AuthPage />}
    </div>
  );
};

export default App;
