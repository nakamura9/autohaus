import React, {useEffect} from 'react'
import NavBar from '../components/nav'
import '../styles/Root.css'
import { Outlet } from 'react-router-dom'
import Spinner from '../components/spinner'
import Footer from '../components/footer'
import SignUpScreen from '../components/sign_up'
import LoginScreen from '../components/login'

const styles = {display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh'}

const Root = (props) => {
    const [config, setConfig] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [signUpVisible, setSignUpVisible] = React.useState(false)
    const [loginVisible, setLoginVisible] = React.useState(false)

    return (
        <main>
            <NavBar toggleSignUp={() => setSignUpVisible(!signUpVisible)}  />
            <div className="root-content">
                {loading ? (
                    <div>
                        <Spinner />
                        <p>Loading...</p>
                    </div>
                ) : <Outlet />}
            </div>
            <Footer />
            <SignUpScreen visible={signUpVisible} toggle={() =>setSignUpVisible(false)} />
            <LoginScreen visible={loginVisible} toggle={() =>setLoginVisible(false)} /> 
            
        </main>
    )
}

export default Root