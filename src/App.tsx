import AppRouter from './router/AppRouter';
import './index.css';
import './styles/globals.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster 
        richColors 
        position="top-right" 
        closeButton
        duration={4000}
      />
    </>
  );
}

export default App; 