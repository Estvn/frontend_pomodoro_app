import React from 'react';
import { AppProvider } from '../context/AppContext';
import AppContent from '../screens/AppContent';

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
