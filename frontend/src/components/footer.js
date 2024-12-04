import styles from "../styles/layout.module.css"
import {Link} from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInstagram as faInstagr, faFacebook, faWhatsapp } from "@fortawesome/free-brands-svg-icons"
import { faQuestion, faList } from "@fortawesome/free-solid-svg-icons"

export default function Footer(props) {
    console.log({props})
    return (
        <footer className={styles.footer}>
            <div>
                <h5>About</h5>
                <ul>
                    <li><FontAwesomeIcon icon={faQuestion}/> <Link to="/about/">About</Link></li>
                    <li><FontAwesomeIcon icon={faList}/> <Link to="/faq/">FAQ</Link></li>
                </ul>
            </div>
            <div>
                <h5>Social</h5>
                <ul>
                    <li><FontAwesomeIcon icon={faInstagr}/> Instagram</li>
                    <li><FontAwesomeIcon icon={faFacebook}/> Facebook</li>
                    <li><FontAwesomeIcon icon={faWhatsapp}/> Whatsapp</li>
                </ul>
            </div>
            <div>
                <h5>Categories</h5>
                <ul>
                    <li><Link>Make</Link></li>
                    <li><Link>Vehicle Type</Link></li>
                    <li><Link>Year</Link></li>
                    <li><Link>Condition</Link></li>
                </ul>
            </div>
            
        </footer>
    )
} 