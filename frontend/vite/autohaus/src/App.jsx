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
import PaymentStatusPage from './pages/payment-status';
import React from 'react'
import axios from './utils/http'
import styles from './styles/components.module.css'
import useStore from './store'

// CMS Imports
import CMSRoot from './cms/components/CMSRoot';
import CMSHome from './cms/pages/Home';
import CMSList from './cms/pages/List';
import CMSCreate from './cms/pages/Create';
import CMSUpdate from './cms/pages/Update';
import CMSDashboard from './cms/pages/Dashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
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
      {
        path: "/payment-status",
        element: <PaymentStatusPage />
      },
      {
        path: "/",
        element: <Index />
      }
    ]
  },
  {
    path: "/cms",
    element: <CMSRoot />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/cms",
        element: <CMSHome />
      },
      {
        path: "/cms/dashboard",
        element: <CMSDashboard />
      },
      {
        path: "/cms/list/:entity",
        element: <CMSList />
      },
      {
        path: "/cms/create/:entity",
        element: <CMSCreate />
      },
      {
        path: "/cms/update/:entity/:id/",
        element: <CMSUpdate />
      },
    ]
  }
])


function App() {
  const { logout: zustandLogout, user: zustandUser, isAuthenticated, setUser: setZustandUser } = useStore()
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
    // If we have a Zustand user but no context user, sync them
    if(zustandUser && !appState.user) {
      setAppState((prevAppState) => ({...prevAppState, user: zustandUser}))
    }

    // If no user in either store, try to restore from token
    if(!(appState && appState.user) && !isAuthenticated) {
      const token = localStorage.getItem('user_token')
      if(token) {
        axios.get(`${url}/api/auth/current-user/`,
        ).then(res => {
          if(res.data.success) {
            // Update both stores
            setAppState((prevAppState, _) => ({...prevAppState, user: res.data.user}))
            // If we have tokens in Zustand, just update user. Otherwise, use the access token from localStorage
            if(!isAuthenticated) {
              setZustandUser(res.data.user, token, null)
            }
          }
        }).catch(err => {
          console.log(err)
          // Token might be expired, clear it
          localStorage.removeItem('user_token')
          zustandLogout()
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
        // Also clear Zustand store
        zustandLogout()
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
