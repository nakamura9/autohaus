import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle, faSpinner, faCreditCard } from '@fortawesome/free-solid-svg-icons'
import axios from '../utils/http'
import { url } from '../constants'
import useStore from '../store'
import Context from '../provider'

const PaymentStatus = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const context = React.useContext(Context)
  const { setUser: setZustandUser } = useStore()

  const [status, setStatus] = useState('checking') // checking, success, failed, pending
  const [message, setMessage] = useState('Verifying your payment...')
  const [subscription, setSubscription] = useState(null)
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 30 // Max 30 polls (about 1 minute with 2 second intervals)

  const pendingId = searchParams.get('pending_id')
  const subscriptionId = searchParams.get('subscription_id')
  const pollUrl = searchParams.get('pollurl')

  const checkPaymentStatus = useCallback(async () => {
    try {
      let endpoint = `${url}/billing/check-payment-status/?`

      if (pendingId) {
        endpoint += `pending_id=${pendingId}`
      } else if (subscriptionId) {
        endpoint += `subscription_id=${subscriptionId}`
      } else if (pollUrl) {
        // Use payment-success endpoint for pollurl
        const response = await axios.get(`${url}/billing/payment-success/?pollurl=${encodeURIComponent(pollUrl)}`)
        handlePaymentResponse(response.data)
        return
      } else {
        setStatus('failed')
        setMessage('Invalid payment reference. Please contact support.')
        return
      }

      const response = await axios.get(endpoint)
      handlePaymentResponse(response.data)
    } catch (error) {
      console.error('Payment status check failed:', error)
      if (pollCount < maxPolls) {
        // Keep trying on network errors
        setPollCount(prev => prev + 1)
      } else {
        setStatus('failed')
        setMessage('Unable to verify payment status. Please contact support.')
      }
    }
  }, [pendingId, subscriptionId, pollUrl, pollCount])

  const handlePaymentResponse = (data) => {
    if (data.success) {
      if (data.status === 'completed' || data.status === 'active' || data.message) {
        // Payment successful
        setStatus('success')
        setMessage(data.message || 'Payment successful!')
        setSubscription(data.subscription)

        // If tokens are returned (new user registration), store them
        if (data.access && data.refresh) {
          // Store in Zustand
          setZustandUser(data.user, data.access, data.refresh)
          // Also update context
          if (context.setUser) {
            context.setUser(data.user)
          }
          // Store token for legacy support
          localStorage.setItem('user_token', data.access)
        }
      } else if (data.status === 'pending') {
        // Still pending, continue polling
        setStatus('pending')
        setMessage(`Payment is being processed... (${data.payment_status || 'waiting'})`)
        setPollCount(prev => prev + 1)
      }
    } else {
      setStatus('failed')
      setMessage(data.error || 'Payment verification failed')
    }
  }

  useEffect(() => {
    // Initial check
    checkPaymentStatus()
  }, [])

  useEffect(() => {
    // Continue polling if status is pending or checking
    if ((status === 'pending' || status === 'checking') && pollCount < maxPolls && pollCount > 0) {
      const timer = setTimeout(() => {
        checkPaymentStatus()
      }, 2000) // Poll every 2 seconds

      return () => clearTimeout(timer)
    } else if (pollCount >= maxPolls && status !== 'success') {
      setStatus('failed')
      setMessage('Payment verification timed out. If you completed payment, please contact support.')
    }
  }, [pollCount, status, checkPaymentStatus])

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" size="4x" />
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" size="4x" />
      case 'pending':
      case 'checking':
      default:
        return <FontAwesomeIcon icon={faSpinner} className="text-amber-500 animate-spin" size="4x" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-900/20 border-green-500'
      case 'failed':
        return 'bg-red-900/20 border-red-500'
      default:
        return 'bg-amber-900/20 border-amber-500'
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className={`max-w-md w-full rounded-lg border-2 p-8 text-center ${getStatusColor()}`}>
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'pending' && 'Processing Payment'}
          {status === 'checking' && 'Verifying Payment'}
        </h1>

        <p className="text-gray-300 mb-6">{message}</p>

        {subscription && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold text-white mb-2">Subscription Details</h3>
            <p className="text-gray-300"><strong>Plan:</strong> {subscription.plan}</p>
            {subscription.expires_at && (
              <p className="text-gray-300"><strong>Expires:</strong> {new Date(subscription.expires_at).toLocaleDateString()}</p>
            )}
            {subscription.status && (
              <p className="text-gray-300"><strong>Status:</strong> {subscription.status}</p>
            )}
          </div>
        )}

        {(status === 'pending' || status === 'checking') && (
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((pollCount / maxPolls) * 100, 100)}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {status === 'success' && (
            <>
              <button
                onClick={() => navigate('/cms')}
                className="w-full bg-amber-500 text-black font-bold py-3 px-6 rounded-md hover:bg-amber-400 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/cms/create/vehicle')}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
              >
                Create Your First Listing
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <button
                onClick={() => checkPaymentStatus()}
                className="w-full bg-amber-500 text-black font-bold py-3 px-6 rounded-md hover:bg-amber-400 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/sell')}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Plans
              </button>
              <a
                href="/contact"
                className="text-amber-500 hover:text-amber-400 text-sm"
              >
                Contact Support
              </a>
            </>
          )}
        </div>

        {(status === 'pending' || status === 'checking') && (
          <p className="text-gray-500 text-xs mt-4">
            <FontAwesomeIcon icon={faCreditCard} className="mr-1" />
            Do not close this page while payment is being verified
          </p>
        )}
      </div>
    </div>
  )
}

export default PaymentStatus
