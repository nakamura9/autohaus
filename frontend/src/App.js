import './App.css';
import Index from './pages';
import {
  createBrowserRouter,
  data,
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
import FAQPage from './pages/faq';
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
        path: "/faq",
        element: <FAQPage />
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
    accountMenu: true,
    accountVisible: true,
    user: null
  })

  React.useEffect(() => {
    
    localStorage.setItem('appState', JSON.stringify(appState))
  }, [appState])

  React.useEffect(() => {
    const data = localStorage.getItem('appState')
    if(data) {
      setAppState(JSON.parse(data))
    }
  }, [])

  return (
    <Context.Provider value={{
      ...appState,
      toggleSignUp: () => {
        setAppState((prevAppState, _) => ({...appState, signUpVisible: !prevAppState.signUpVisible, loginVisible: false}))
      },
      toggleLogin: () => {
        setAppState((prevAppState, _) => ({...prevAppState, loginVisible: !prevAppState.loginVisible, signUpVisible: false}))
      },
      toggleAccountMenu: () => {
        setAppState((prevAppState, _) => ({...prevAppState, accountMenu: !prevAppState.accountMenu}))
      },
      toggleAccount: () => {
        setAppState((prevAppState, _) => ({...prevAppState, accountVisible: !prevAppState.accountVisible}))
      },
      setUser: (data) => {
        setAppState((prevAppState, _) => ({...prevAppState, user: data}))
      }

    }}>
      <RouterProvider router={router} />
    </Context.Provider>
  );
}

export default App;
