import React, {useEffect} from 'react'
import NavBar from '../components/nav'
import '../styles/Root.css'
import { Outlet } from 'react-router-dom'
import Spinner from '../components/spinner'
import Footer from '../components/footer'
import SignUpScreen from '../components/sign_up'
import LoginScreen from '../components/login'
import AccountScreen from '../components/account'

const styles = {display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh'}

const Root = (props) => {
    const [config, setConfig] = React.useState({})
    const [loading, setLoading] = React.useState(false)

    return (
        <main>
            <NavBar />
            <div className="root-content">
                {loading ? (
                    <div>
                        <Spinner />
                        <p>Loading...</p>
                    </div>
                ) : <Outlet />}
            </div>
            <Footer />
            <SignUpScreen />
            <LoginScreen/> 
            <AccountScreen /> 
            
        </main>
    )
}

export default Root