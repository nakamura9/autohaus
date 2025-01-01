import styles from "../styles/layout.module.css"
import {Link} from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInstagram as faInstagr, faFacebook, faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons"
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
                    <li><FontAwesomeIcon icon={faInstagram}/> Instagram</li>
                    <li><FontAwesomeIcon icon={faFacebook}/> Facebook</li>
                    <li><FontAwesomeIcon icon={faWhatsapp}/> Whatsapp</li>
                </ul>
            </div>
            <div>
                <h5>Categories</h5>
                <ul>
                    <li><Link to={`/buy/?make=3`}>Honda</Link></li>
                    <li><Link to={`/buy/?make=4`}>Toyota</Link></li>
                    <li><Link to={`/buy/?make=5`}>Mercedes</Link></li>
                    <li><Link to={`/buy/?min_year=2020`}>Newer Cars</Link></li>
                    <li><Link to={`/buy/?max_year=2014`}>Older Vehicles</Link></li>
                    <li><Link to={`/buy/?transmisssion=manual`}>Manual</Link></li>
                    <li><Link to={`/buy/?transmission=automatic`}>Automatic</Link></li>
                </ul>
            </div>
            
        </footer>
    )
} 