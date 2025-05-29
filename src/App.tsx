import './App.css';
import { ToastContainer } from 'react-toastify';
import { ChatList } from './components/ChatList/ChatList';

function App() {
  return (
    <div>
      <ChatList />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
