import { Client } from '@microsoft/microsoft-graph-client'
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser'
import { PublicClientApplication, AccountInfo, InteractionType } from '@azure/msal-browser'
import { msalConfig, loginRequest, graphConfig } from '@/config/microsoft'

export class GraphService {
  private static instance: GraphService
  private msalInstance: PublicClientApplication
  private graphClient: Client | null = null
  private account: AccountInfo | null = null

  private constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig)
  }

  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService()
    }
    return GraphService.instance
  }

  public async initialize() {
    await this.msalInstance.initialize()
    const accounts = this.msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      this.account = accounts[0]
      await this.getGraphClient()
    }
  }

  public async login() {
    try {
      const result = await this.msalInstance.loginPopup(loginRequest)
      this.account = result.account
      await this.getGraphClient()
      return result
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  public async logout() {
    try {
      await this.msalInstance.logoutPopup()
      this.account = null
      this.graphClient = null
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      // Validate token with Microsoft Graph API
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Invalid token')
      }

      // Here you could add additional checks for admin role
      // For now, we just verify the token is valid

      return true
    } catch (error) {
      console.error('Error validating token:', error)
      throw error
    }
  }

  private async getGraphClient() {
    if (!this.account) {
      throw new Error('No account found')
    }

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalInstance,
      {
        account: this.account,
        scopes: loginRequest.scopes,
        interactionType: InteractionType.Popup,
      }
    )

    this.graphClient = Client.initWithMiddleware({
      authProvider,
    })
  }

  public async createMeeting(meetingData: {
    subject: string
    body?: string
    start: Date
    end: Date
    attendees: string[]
    location?: string
  }) {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized')
    }

    const event = {
      subject: meetingData.subject,
      body: {
        contentType: 'HTML',
        content: meetingData.body || '',
      },
      start: {
        dateTime: meetingData.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingData.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meetingData.attendees.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    }

    try {
      const response = await this.graphClient
        .api(graphConfig.graphEventsEndpoint)
        .post(event)
      return response
    } catch (error) {
      console.error('Error creating meeting:', error)
      throw error
    }
  }

  public async getMeetings(startDate?: Date, endDate?: Date) {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized')
    }

    let filter = ''
    if (startDate && endDate) {
      filter = `start/dateTime ge '${startDate.toISOString()}' and end/dateTime le '${endDate.toISOString()}'`
    }

    try {
      const response = await this.graphClient
        .api(graphConfig.graphEventsEndpoint)
        .filter(filter)
        .select('subject,start,end,attendees,onlineMeeting')
        .orderby('start/dateTime')
        .get()
      return response.value
    } catch (error) {
      console.error('Error fetching meetings:', error)
      throw error
    }
  }

  public async updateMeeting(
    meetingId: string,
    meetingData: {
      subject?: string
      body?: string
      start?: Date
      end?: Date
      attendees?: string[]
      location?: string
    }
  ) {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized')
    }

    const event: any = {}

    if (meetingData.subject) event.subject = meetingData.subject
    if (meetingData.body) {
      event.body = {
        contentType: 'HTML',
        content: meetingData.body,
      }
    }
    if (meetingData.start) {
      event.start = {
        dateTime: meetingData.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }
    if (meetingData.end) {
      event.end = {
        dateTime: meetingData.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }
    if (meetingData.attendees) {
      event.attendees = meetingData.attendees.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      }))
    }

    try {
      const response = await this.graphClient
        .api(`${graphConfig.graphEventsEndpoint}/${meetingId}`)
        .patch(event)
      return response
    } catch (error) {
      console.error('Error updating meeting:', error)
      throw error
    }
  }

  public async deleteMeeting(meetingId: string) {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized')
    }

    try {
      await this.graphClient
        .api(`${graphConfig.graphEventsEndpoint}/${meetingId}`)
        .delete()
    } catch (error) {
      console.error('Error deleting meeting:', error)
      throw error
    }
  }
} 