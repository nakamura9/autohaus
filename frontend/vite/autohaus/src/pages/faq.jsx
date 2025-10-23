import React from 'react';
import { url } from '../constants';
import Spinner from '../components/spinner';
import axios from '../utils/http'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';


const FAQQuestion = ({question, answer}) => {
    const [open, setOpen] = React.useState(false)

    return (
    <div className="mb-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <button
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
        >
            <span className="text-lg font-semibold text-gray-800 pr-4">{question}</span>
            <FontAwesomeIcon
                icon={open ? faChevronUp : faChevronDown}
                className="text-blue-600 flex-shrink-0 transition-transform duration-200"
            />
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-5 pb-5 pt-0">
                <p className="text-gray-700 leading-relaxed">{answer}</p>
            </div>
        </div>
    </div>)
}

const FAQPage = () => {
    const [faq, setFAQ] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        axios.get(`${url}/faq/`).then(res => {
            if(res.data && res.data.results) {
                setFAQ(res.data.results)
                setLoading(false)
            }
        })
    }, [])

    if(loading)
        return <Spinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Find answers to common questions about buying and selling vehicles on Autohaus
                </p>
            </div>

            <div className="space-y-8">
                {faq.map((cat, catIndex) => (
                    <div key={catIndex} className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {cat.name}
                            </h2>
                            <p className="text-gray-600">
                                {cat.description}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {cat.faq_set.map((q, qIndex) => (
                                <FAQQuestion key={qIndex} {...q} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FAQPage