import { url } from './constants';
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
import SellerPage from './pages/seller';
import FAQPage from './pages/faq';
import React from 'react'
import axios from './utils/http'
import styles from './styles/components.module.css'

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
      {
        path: "/seller/:id",
        element: <SellerPage />
      },
    ]
  }
])


function App() {
  const [appState, setAppState] = React.useState({
    loginVisible: false,
    signUpVisible: false,
    accountMenu: false,
    accountVisible: false,
    accountActiveTab: "my-details",
    user: null,
    toastVisible: false,
    toastMessage: ''
  })

  React.useEffect(() => {
    
    localStorage.setItem('appState', JSON.stringify(appState))
  }, [appState])

  React.useEffect(() => {
    if(!(appState && appState.user)) {
      const token = localStorage.getItem('user_token')
      if(token) {
        axios.get(`${url}/api/user-details/`, 
        ).then(res => {
          setAppState((prevAppState, _) => ({...prevAppState, user: res.data.user}))
        }).catch(err => {
          console.log(err)
        })
      }
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
      },
      signOut: () => {
        localStorage.removeItem('user_token')
        setAppState((prevAppState, _) => ({...prevAppState, user: null}))
      },
      toast: (msg) => {
        setAppState((prevAppState, _) => ({...prevAppState, toastVisible: true, toastMessage: msg}))
        setTimeout(() => {
          setAppState((prevAppState, _) => ({...prevAppState, toastVisible: false, toastMessage: ""}))
        }, 3000)
      },
      setAccountTab: (tab) => {
        setAppState((prevAppState, _) => ({...prevAppState, accountActiveTab: tab}))
      }



    }}>
      <RouterProvider router={router} />
      {appState.toastVisible && <div className={styles.toast}>
        {appState.toastMessage}
      </div>}
    </Context.Provider>
  );
}

export default App;
