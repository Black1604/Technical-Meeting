export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID}`,
    redirectUri: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com'
      : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: [
    'User.Read',
    'Calendars.ReadWrite',
    'Calendars.Read.Shared',
    'Mail.Send',
  ],
}

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphCalendarEndpoint: 'https://graph.microsoft.com/v1.0/me/calendar',
  graphEventsEndpoint: 'https://graph.microsoft.com/v1.0/me/events',
} 