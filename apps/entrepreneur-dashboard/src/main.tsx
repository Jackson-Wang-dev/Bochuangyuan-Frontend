import { authApi } from '@bochuangyuan/api'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useUserStore } from './store/userStore'
import './index.css'

// SSO handoff from official-site: a `bcyToken` query param carries an access token minted there
// against the same backend. Absorb it into the session before the router's auth guard runs.
const ssoParams = new URLSearchParams(window.location.search)
const ssoToken = ssoParams.get('bcyToken')
if (ssoToken) {
  localStorage.setItem('bcyToken', ssoToken)
  useUserStore.setState({ accessToken: ssoToken })
  ssoParams.delete('bcyToken')
  const cleanedSearch = ssoParams.toString()
  window.history.replaceState({}, '', `${window.location.pathname}${cleanedSearch ? `?${cleanedSearch}` : ''}${window.location.hash}`)
  void authApi
    .me()
    .then((user) => useUserStore.getState().setAuth(user, ssoToken, ''))
    .catch(() => useUserStore.getState().clearAuth())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
