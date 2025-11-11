import React from 'react'
import axios from '../utils/http'
import { url } from '../constants'
import Context from '../provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons';


const ContactPage = () => {
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [submitted, setSubmitted] = React.useState(false)
    const context  = React.useContext(Context)

    const submit = (e) => {
        e.preventDefault()
        axios.post(`${url}/api/submit-contact/`, {
            name: name,
            email: email,
            phone: phone,
            message: message,
        }).then(res => {
            if(res.data.id) {
                context.toast("Successfully submitted contact")
                setSubmitted(true)
                setName("")
                setEmail("")
                setPhone("")
                setMessage("")
                setTimeout(() => setSubmitted(false), 5000)
            }
        }).catch(() => {
            context.toast("Failed to submit. Please try again.")
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                        {submitted && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                                <p className="text-green-800 font-medium">Message sent successfully!</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    id="name"
                                    value={name}
                                    onChange={evt => setName(evt.target.value)}
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    value={email}
                                    onChange={evt => setEmail(evt.target.value)}
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    value={phone}
                                    onChange={evt => setPhone(evt.target.value)}
                                    type="tel"
                                    required
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={evt => setMessage(evt.target.value)}
                                    rows={6}
                                    required
                                    placeholder="Tell us how we can help you..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        {/* Contact Details Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 lg:p-10 text-white">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                            <p className="text-blue-100 mb-8">
                                Reach out to us through any of these channels. We're here to help!
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a href="mailto:info@zimforward.com" className="text-blue-100 hover:text-white transition">
                                            info@zimforward.com
                                        </a>
                                        <br />
                                        <a href="mailto:support@zimforward.com" className="text-blue-100 hover:text-white transition">
                                            support@zimforward.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                        <FontAwesomeIcon icon={faPhone} className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <a href="tel:+15551234567" className="text-blue-100 hover:text-white transition">
                                            +1 (555) 123-4567
                                        </a>
                                        <br />
                                        <a href="tel:+15559876543" className="text-blue-100 hover:text-white transition">
                                            +1 (555) 987-6543
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <p className="text-blue-100">
                                            123 Auto Street<br />
                                            Suite 456<br />
                                            City Name, State 12345<br />
                                            Country
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                        <FontAwesomeIcon icon={faClock} className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Business Hours</h3>
                                        <p className="text-blue-100">
                                            Monday - Friday: 9:00 AM - 6:00 PM<br />
                                            Saturday: 10:00 AM - 4:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Contact Us?</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                                    <span>Get expert advice on buying or selling vehicles</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                                    <span>Ask questions about our platform features</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                                    <span>Report issues or provide feedback</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
                                    <span>Partner with us as a dealer</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ContactPage