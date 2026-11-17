import { useState } from 'react'
import './Login.css'

const alerts = [
  { type: 'O−', hospital: 'St. Mary Medical', distance: '1.8 km' },
  { type: 'A+', hospital: 'Northside Hospital', distance: '3.2 km' },
  { type: 'B−', hospital: 'City General', distance: '4.6 km' },
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.status === 401) {
        setError('Invalid email or password')
        return
      }

      if (!response.ok) {
        throw new Error('Login request failed')
      }

      const data = await response.json()
      const role = String(data.role ?? '').toLowerCase()
      const destination = role.includes('hospital')
        ? '/hospital'
        : role.includes('donor')
          ? '/donor'
          : null

      if (!destination) {
        throw new Error('Unknown user role')
      }

      sessionStorage.setItem(
        'auth',
        JSON.stringify({ email, password, role: data.role }),
      )
      window.location.assign(destination)
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="story-title">
        <div className="story-content">
          <a className="brand" href="/" aria-label="Bloodmatch home">
            <span className="brand-mark" aria-hidden="true">+</span>
            <span>bloodmatch</span>
          </a>

          <div className="story-copy">
            <p className="eyebrow"><span className="live-dot" /> Live matching network</p>
            <h1 id="story-title">The right donors, <em>first.</em></h1>
            <p className="story-description">
              When every minute matters, nearby donors can make all the difference.
              Connect with the people who can help.
            </p>
          </div>

          <div className="alert-panel" aria-label="Nearby urgent alerts">
            <div className="alert-heading">
              <span>Nearby urgent alerts</span>
              <span className="alert-count">3 active</span>
            </div>
            <ul className="alert-list">
              {alerts.map((alert) => (
                <li className="alert-item" key={alert.hospital}>
                  <span className="blood-pill">{alert.type}</span>
                  <span className="alert-hospital">{alert.hospital}</span>
                  <span className="alert-distance">{alert.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="story-footer">Every match is a chance to change a life.</p>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <a className="mobile-brand brand" href="/" aria-label="Bloodmatch home">
            <span className="brand-mark" aria-hidden="true">+</span>
            <span>bloodmatch</span>
          </a>
          <div className="form-heading">
            <p className="eyebrow">Welcome back</p>
            <h2 id="login-title">Sign in to your account</h2>
            <p>Access your matching dashboard and stay connected.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="register-prompt">
            New to bloodmatch? <a href="/register">Register</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
