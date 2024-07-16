import './App.css';
import Approutes from './routes';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Approutes />
      </Router>
    </div>
  );
}

export default App;