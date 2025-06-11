import React from 'react';
import './styles/App.css';

import HomePage from './pages/HomePage';

function App() {
  return (
    <div className="App">
      {/* header or router */}
      <HomePage />
      {/* <footer style={{ textAlign: 'center', marginTop: '50px' }}>&copy; 2025 Teacher's Pet</footer> */}
    </div>
  );
}

export default App;