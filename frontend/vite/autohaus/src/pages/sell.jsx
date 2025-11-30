import React, { useContext, useEffect } from 'react'
import styles from '../styles/sell.module.css'
import { url } from '../constants'
import Context from '../provider'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-responsive-carousel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCar, faChartLine, faInfinity, faArrowRight } from '@fortawesome/free-solid-svg-icons'


const SamplePhotoCarousel = () => {
  const slides = [
    <div className={styles.tips}>
      <h4>Tips for taking great photos</h4>
      <ul>
        <li>Use a well lit area, preferrably natural light and no flash.</li>
        <li>Shoot against a uniform background.</li>
        <li>Make sure your vehicle is fully visible.</li>
        <li>Shoot the image in auto mode.</li>
        <li>Make sure there are no blur or filter effects applied to the image.</li>
      </ul>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/front.png`} alt="Front view" />
      </div>
      <h5>Front View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/rear.png`} alt="Rear view" />
      </div>
      <h5>Rear View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/side.png`} alt="Side view" />
      </div>
      <h5>Side View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/front three quarter.png`} alt="Front three quarter view" />
      </div>
      <h5>Front Three Quarter View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/rear three quarter.png`} alt="Rear three quarter view" />
      </div>
      <h5>Rear Three Quarter View</h5>
    </div>,
    <div>
      <div className={styles.carouselImg}>
        <img src={`${url}/sample_car_photos/dashboard.png`} alt="Dashboard view" />
      </div>
      <h5>Dashboard View</h5>
    </div>
  ]

  return (
    <div className={styles.imgCarousel}>
      <Carousel>
        {slides.map((s, i) => (<div key={i}>{s}</div>))}
      </Carousel>
    </div>
  )
}


const SubscriptionFeature = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="text-amber-500 mt-1">
      <FontAwesomeIcon icon={icon} size="lg" />
    </div>
    <div>
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
)


const SellPage = () => {
  const context = useContext(Context)
  const navigate = useNavigate()

  // Redirect subscribed users to CMS
  useEffect(() => {
    if (context.user?.has_subscription) {
      navigate('/cms/list/vehicle')
    }
  }, [context.user, navigate])

  const handleSubscribe = () => {
    context.setAccountTab('subscriptions')
    context.toggleAccount()
  }

  const handleLogin = () => {
    context.toggleLogin()
  }

  const handleSignUp = () => {
    // Direct to subscription/checkout page instead of regular signup
    navigate('/checkout')
  }

  // If user has subscription, show loading while redirecting
  if (context.user?.has_subscription) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to CMS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Sell Your Vehicle on Zim Forward
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Join thousands of sellers on Zimbabwe's premier vehicle marketplace.
          Subscribe to start listing your vehicles today.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Photo Tutorial Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            How to Take Great Photos
          </h2>
          <p className="text-gray-400 mb-4">
            High-quality photos help your listings stand out and sell faster.
            Browse through our guide to learn the best angles and techniques.
          </p>
          <SamplePhotoCarousel />
        </div>

        {/* Subscription CTA Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Start Selling Today
          </h2>

          <div className="mb-6">
            <SubscriptionFeature
              icon={faCar}
              title="List Your Vehicles"
              description="Create professional listings with multiple photos and detailed descriptions"
            />
            <SubscriptionFeature
              icon={faChartLine}
              title="Track Performance"
              description="Access analytics to see how your listings are performing"
            />
            <SubscriptionFeature
              icon={faInfinity}
              title="Unlimited Listings"
              description="Post as many vehicles as you want during your subscription"
            />
            <SubscriptionFeature
              icon={faCheckCircle}
              title="CMS Access"
              description="Full access to our content management system to manage all your listings"
            />
          </div>

          {/* Call to Action */}
          {!context.user ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-lg mb-2">
                  Ready to Start Selling?
                </h3>
                <p className="text-black/80 text-sm mb-4">
                  Subscribe to a plan to create your seller account and start listing vehicles.
                </p>
                <button
                  onClick={handleSignUp}
                  className="bg-black text-white font-bold px-6 py-3 rounded-md hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
                >
                  Subscribe Now
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={handleLogin}
                    className="text-amber-500 hover:text-amber-400 font-semibold"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-center">
                <h3 className="text-black font-bold text-lg mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-black/80 text-sm mb-4">
                  Subscribe to unlock the ability to create and manage vehicle listings.
                </p>
                <button
                  onClick={handleSubscribe}
                  className="bg-black text-white font-bold px-6 py-3 rounded-md hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
                >
                  View Plans
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-black font-bold text-xl">1</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Subscribe</h3>
            <p className="text-gray-400 text-sm">
              Choose a subscription plan that fits your needs and complete the payment.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-black font-bold text-xl">2</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Create Listings</h3>
            <p className="text-gray-400 text-sm">
              Access the CMS to create detailed listings with photos and descriptions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-black font-bold text-xl">3</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Sell Vehicles</h3>
            <p className="text-gray-400 text-sm">
              Reach thousands of buyers and sell your vehicles quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellPage
