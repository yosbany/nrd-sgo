import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
// ... other imports ...

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      // ... other routes ...
    }
  ],
  {
    basename: '/nrd-sgo'
  }
); 