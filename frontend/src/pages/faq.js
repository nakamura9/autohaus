import React from 'react';
import { url } from '../constants';
import Spinner from '../components/spinner';
import axios from 'axios'
import styles from '../styles/faq.module.css'


const FAQQuestion = ({question, answer}) => {
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => {
        console.log(open)
    }, [open])
    return (
    <div className={styles.faq}>
        <div  className={styles.faqQuestion} onClick={() => setOpen(!open)}>
            {question}
        </div>
        <div className={styles.faqAnswer} style={{height: open ? "fit-content": "0px"}}><p>{answer}</p></div>
    </div>)
}

const FAQPage = () => {
    const [faq, setFAQ] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        axios.get(`${url}/faq/`).then(res => {
            console.log(res.data)
            if(res.data && res.data.results) {
                setFAQ(res.data.results)
                setLoading(false)
            }
        })
    }, [])

    if(loading) 
        return <Spinner />;

    return (
        <div>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            {faq.map(cat => (
                <div>
                    <h5>{cat.name}</h5>
                    <p>{cat.description}</p>
                    {cat.faq_set.map(q => (
                        <FAQQuestion {...q} />
                    ))}
                </div>
            ))}
        </div>
    )
}

export default FAQPage