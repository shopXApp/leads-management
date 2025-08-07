/**
 * Email Service for handling OAuth authentication and email operations
 * This is a frontend-only implementation using browser APIs
 */

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
}

export interface EmailProvider {
  name: string;
  provider: 'gmail' | 'outlook';
  config: OAuthConfig;
  authUrl: string;
  tokenUrl: string;
  revokeUrl: string;
}

// Email provider configurations
export const emailProviders: Record<string, EmailProvider> = {
  gmail: {
    name: 'Gmail',
    provider: 'gmail',
    config: {
      clientId: '', // Will need to be configured by user
      redirectUri: `${window.location.origin}/oauth/callback`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    },
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke'
  },
  outlook: {
    name: 'Microsoft Outlook',
    provider: 'outlook',
    config: {
      clientId: '', // Will need to be configured by user
      redirectUri: `${window.location.origin}/oauth/callback`,
      scopes: [
        'https://graph.microsoft.com/mail.send',
        'https://graph.microsoft.com/mail.read',
        'https://graph.microsoft.com/user.read'
      ]
    },
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
  }
};

class EmailService {
  private cryptoKey: CryptoKey | null = null;

  /**
   * Initialize encryption key for token storage
   */
  async initializeEncryption(): Promise<void> {
    // Generate or retrieve encryption key from localStorage
    const keyData = localStorage.getItem('emailServiceKey');
    
    if (keyData) {
      const importedKey = await window.crypto.subtle.importKey(
        'raw',
        new Uint8Array(JSON.parse(keyData)),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      this.cryptoKey = importedKey;
    } else {
      // Generate new key
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      localStorage.setItem('emailServiceKey', JSON.stringify(Array.from(new Uint8Array(exportedKey))));
      this.cryptoKey = key;
    }
  }

  /**
   * Encrypt OAuth tokens for secure storage
   */
  async encryptTokens(tokens: OAuthTokens): Promise<string> {
    if (!this.cryptoKey) {
      await this.initializeEncryption();
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(tokens));
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.cryptoKey!,
      data
    );

    const result = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };

    return JSON.stringify(result);
  }

  /**
   * Decrypt OAuth tokens from storage
   */
  async decryptTokens(encryptedData: string): Promise<OAuthTokens> {
    if (!this.cryptoKey) {
      await this.initializeEncryption();
    }

    const { iv, data } = JSON.parse(encryptedData);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      this.cryptoKey!,
      new Uint8Array(data)
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  /**
   * Start OAuth flow for email provider
   */
  async startOAuthFlow(provider: 'gmail' | 'outlook', clientId: string): Promise<void> {
    const emailProvider = emailProviders[provider];
    if (!emailProvider) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    // Update client ID in config
    emailProvider.config.clientId = clientId;

    // Generate state parameter for security
    const state = window.crypto.getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    localStorage.setItem('oauthState', state);
    localStorage.setItem('oauthProvider', provider);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: emailProvider.config.clientId,
      redirect_uri: emailProvider.config.redirectUri,
      scope: emailProvider.config.scopes.join(' '),
      response_type: 'code',
      state,
      access_type: 'offline', // For refresh tokens
      prompt: 'consent' // Force consent to get refresh token
    });

    const authUrl = `${emailProvider.authUrl}?${params.toString()}`;

    // Open popup window for OAuth
    const popup = window.open(
      authUrl,
      'oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for popup completion
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(checkPopup);
            // Check if OAuth was successful
            const authCode = localStorage.getItem('oauthCode');
            if (authCode) {
              localStorage.removeItem('oauthCode');
              resolve();
            } else {
              reject(new Error('OAuth flow was cancelled'));
            }
          }
        } catch (error) {
          // Cross-origin error, popup still open
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        popup?.close();
        reject(new Error('OAuth flow timed out'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, provider: 'gmail' | 'outlook'): Promise<OAuthTokens> {
    const emailProvider = emailProviders[provider];
    if (!emailProvider) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    const tokenData = {
      client_id: emailProvider.config.clientId,
      client_secret: '', // Note: This needs to be handled securely
      code,
      grant_type: 'authorization_code',
      redirect_uri: emailProvider.config.redirectUri
    };

    try {
      const response = await fetch(emailProvider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenData).toString()
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope
      };
    } catch (error) {
      throw new Error(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh OAuth tokens
   */
  async refreshTokens(refreshToken: string, provider: 'gmail' | 'outlook'): Promise<OAuthTokens> {
    const emailProvider = emailProviders[provider];
    if (!emailProvider) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    const tokenData = {
      client_id: emailProvider.config.clientId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    };

    try {
      const response = await fetch(emailProvider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenData).toString()
      });

      if (!response.ok) {
        throw new Error('Failed to refresh tokens');
      }

      const tokens = await response.json();
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send email using Gmail API
   */
  async sendEmailGmail(tokens: OAuthTokens, emailData: any): Promise<string> {
    // Construct email message
    const email = [
      `To: ${emailData.to.join(', ')}`,
      emailData.cc ? `Cc: ${emailData.cc.join(', ')}` : '',
      emailData.bcc ? `Bcc: ${emailData.bcc.join(', ')}` : '',
      `Subject: ${emailData.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      emailData.htmlContent
    ].filter(line => line !== '').join('\r\n');

    // Base64 encode the email
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email via Gmail');
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      throw new Error(`Gmail send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send email using Outlook API
   */
  async sendEmailOutlook(tokens: OAuthTokens, emailData: any): Promise<string> {
    const message = {
      subject: emailData.subject,
      body: {
        contentType: 'HTML',
        content: emailData.htmlContent
      },
      toRecipients: emailData.to.map((email: string) => ({
        emailAddress: { address: email }
      })),
      ccRecipients: emailData.cc?.map((email: string) => ({
        emailAddress: { address: email }
      })) || [],
      bccRecipients: emailData.bcc?.map((email: string) => ({
        emailAddress: { address: email }
      })) || []
    };

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          saveToSentItems: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email via Outlook');
      }

      // Outlook API doesn't return message ID on send, so we generate one
      return `outlook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      throw new Error(`Outlook send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generic send email method
   */
  async sendEmail(provider: 'gmail' | 'outlook', tokens: OAuthTokens, emailData: any): Promise<string> {
    // Check if tokens are expired and refresh if needed
    if (new Date() >= new Date(tokens.expiresAt)) {
      const refreshedTokens = await this.refreshTokens(tokens.refreshToken, provider);
      tokens = refreshedTokens;
    }

    switch (provider) {
      case 'gmail':
        return this.sendEmailGmail(tokens, emailData);
      case 'outlook':
        return this.sendEmailOutlook(tokens, emailData);
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(provider: 'gmail' | 'outlook', tokens: OAuthTokens): Promise<any> {
    let apiUrl = '';
    
    switch (provider) {
      case 'gmail':
        apiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        break;
      case 'outlook':
        apiUrl = 'https://graph.microsoft.com/v1.0/me';
        break;
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Profile fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke OAuth tokens
   */
  async revokeTokens(provider: 'gmail' | 'outlook', tokens: OAuthTokens): Promise<void> {
    const emailProvider = emailProviders[provider];
    if (!emailProvider) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    try {
      const response = await fetch(emailProvider.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: tokens.accessToken
        }).toString()
      });

      if (!response.ok) {
        console.warn('Failed to revoke tokens on server, but continuing with local cleanup');
      }
    } catch (error) {
      console.warn('Token revocation failed:', error);
    }
  }
}

export const emailService = new EmailService();
export default emailService;