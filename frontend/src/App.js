import './App.css';
import Index from './pages';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ErrorPage from './pages/error';
import Root from './pages/root';
import Context from './provider';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import SellPage from './pages/sell';
import BuyPage from './pages/buy';
import ProductPage from './pages/product';
import React from 'react'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Index />
      },
      {
        path: "/buy",
        element: <BuyPage />
      },
      {
        path: "/sell",
        element: <SellPage />
      },
      {
        path: "/contact",
        element: <ContactPage />
      },
      {
        path: "/about",
        element: <AboutPage />
      },
      {
        path: "/product/:id",
        element: <ProductPage />
      },
    ]
  }
])


function App() {
  const [appState, setAppState] = React.useState({
    loginVisible: false,
    signUpVisible: false,
  })

  return (
    <Context.Provider value={{
      ...appState,
      toggleSignUp: () => {
        setAppState({...appState, signUpVisible: !appState.signUpVisible, loginVisible: false})
      },
      toggleLogin: () => {
        setAppState({...appState, loginVisible: !appState.loginVisible, signUpVisible: false})
      }
    }}>
      <RouterProvider router={router} />
    </Context.Provider>
  );
}

export default App;
