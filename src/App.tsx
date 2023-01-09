import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/login';
import PostTable from './pages/posts/PostTable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PostTable />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
