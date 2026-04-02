import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/errors';

import { useSessionStore } from '../store/sessionStore';

function MicrosoftMark() {
  return (
    <span className="microsoft-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSessionStore((state) => state.token);
  const status = useSessionStore((state) => state.status);
  const login = useSessionStore((state) => state.login);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin() {
    try {
      await login();
      toast.success('Microsoft SSO session started.');
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="login-screen">
      <section className="login-screen__hero">
        <div className="login-hero">
          <BrandMark inverted />

          <div className="login-hero__content">
            <span className="hero-pill">INTERNAL DASHBOARD</span>
            <h1>
              Performance
              <br />
              analytics at
              <br />
              your fingertips.
            </h1>
            <p>
              Real-time Salesforce insights, automated reporting, and operational intelligence
              built for the Aspect team.
            </p>
          </div>

          <div className="login-hero__grid">
            <article className="hero-feature">
              <span className="hero-feature__icon">⚡</span>
              <strong>Live Data</strong>
              <p>Direct Salesforce sync with real-time metrics.</p>
            </article>
            <article className="hero-feature">
              <span className="hero-feature__icon">▦</span>
              <strong>Visual Insights</strong>
              <p>Charts and drilldowns for every KPI.</p>
            </article>
            <article className="hero-feature">
              <span className="hero-feature__icon">◌</span>
              <strong>Secure Access</strong>
              <p>Role-based auth for your team.</p>
            </article>
          </div>

          <div className="login-hero__footer">
            <span>© 2025 Aspect Inc.</span>
            <span>Secure connection</span>
          </div>
        </div>
      </section>

      <section className="login-screen__auth">
        <div className="login-auth">
          <div className="login-auth__panel">
            <div>
              <h2>Welcome back</h2>
              <p>Continue with your Aspect Microsoft account.</p>
            </div>

            <Button
              className="microsoft-button"
              fullWidth
              onClick={handleLogin}
              disabled={status === 'loading'}
            >
              <MicrosoftMark />
              <span>{status === 'loading' ? 'Connecting…' : 'Sign in with Microsoft'}</span>
            </Button>

            <div className="login-note">
              <span className="login-note__icon">🔒</span>
              <p>Microsoft SSO is the only sign-in method for this dashboard.</p>
            </div>

            <div className="login-auth__footer">
              <span>MICROSOFT ACCESS ONLY</span>
              <p>Email and password sign-in has been removed from this screen.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
