import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type PopupRequest,
} from '@azure/msal-browser';

function requireEnv(name: string, value: string | undefined): string {
  const resolvedValue = value?.trim();
  if (!resolvedValue) {
    throw new Error(`${name} is missing. Update frontend/.env to enable Microsoft sign-in.`);
  }
  return resolvedValue;
}

function resolveRedirectUri(value: string | undefined): string {
  const resolvedValue = value?.trim();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  if (!resolvedValue) {
    return `${origin}/auth-callback.html`;
  }

  if (resolvedValue.startsWith('http://') || resolvedValue.startsWith('https://')) {
    return resolvedValue;
  }

  if (resolvedValue.startsWith('/')) {
    return `${origin}${resolvedValue}`;
  }

  return `${origin}/${resolvedValue}`;
}

const clientId = requireEnv('VITE_MSAL_CLIENT_ID', import.meta.env.VITE_MSAL_CLIENT_ID);
const authority = requireEnv('VITE_MSAL_AUTHORITY', import.meta.env.VITE_MSAL_AUTHORITY);
const redirectUri = resolveRedirectUri(import.meta.env.VITE_MSAL_REDIRECT_URI);
const apiScope = requireEnv('VITE_MSAL_API_SCOPE', import.meta.env.VITE_MSAL_API_SCOPE);

const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', apiScope],
};

const msalClient = new PublicClientApplication({
  auth: {
    clientId,
    authority,
    redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
  },
});

let initializePromise: Promise<void> | null = null;

async function initializeMsal(): Promise<void> {
  if (initializePromise === null) {
    initializePromise = msalClient.initialize().then(() => {
      const account = getActiveAccount();
      if (account) {
        msalClient.setActiveAccount(account);
      }
    });
  }

  await initializePromise;
}

function getActiveAccount(): AccountInfo | null {
  return msalClient.getActiveAccount() ?? msalClient.getAllAccounts()[0] ?? null;
}

function normalizeAuthError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Microsoft sign-in failed.');
}

export async function acquireMicrosoftAccessToken(): Promise<string> {
  await initializeMsal();

  const account = getActiveAccount();
  if (account) {
    msalClient.setActiveAccount(account);
    try {
      const result = await msalClient.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return result.accessToken;
    } catch (error) {
      if (!(error instanceof InteractionRequiredAuthError)) {
        throw normalizeAuthError(error);
      }

      const popupResult = await msalClient.acquireTokenPopup({
        ...loginRequest,
        account,
      });
      if (popupResult.account) {
        msalClient.setActiveAccount(popupResult.account);
      }
      return popupResult.accessToken;
    }
  }

  try {
    const loginResult = await msalClient.loginPopup(loginRequest);
    if (loginResult.account) {
      msalClient.setActiveAccount(loginResult.account);
    }

    if (loginResult.accessToken) {
      return loginResult.accessToken;
    }

    const signedInAccount = loginResult.account ?? getActiveAccount();
    if (!signedInAccount) {
      throw new Error('Microsoft account details were not returned after sign-in.');
    }

    const tokenResult = await msalClient.acquireTokenSilent({
      ...loginRequest,
      account: signedInAccount,
    });
    return tokenResult.accessToken;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function logoutFromMicrosoft(): Promise<void> {
  await initializeMsal();
  const account = getActiveAccount();
  if (!account) {
    return;
  }

  await msalClient.logoutPopup({
    account,
    mainWindowRedirectUri: redirectUri,
  });
}
