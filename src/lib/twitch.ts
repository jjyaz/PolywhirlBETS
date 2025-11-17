interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

interface TwitchStreamsResponse {
  data: TwitchStream[];
  pagination?: {
    cursor?: string;
  };
}

interface TwitchGamesResponse {
  data: TwitchGame[];
}

class TwitchAPIClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private baseURL = 'https://api.twitch.tv/helix';
  private authURL = 'https://id.twitch.tv/oauth2/token';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(this.authURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get Twitch access token: ${response.statusText}`);
    }

    const data: TwitchAuthResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const token = await this.getAccessToken();

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': this.clientId,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitch API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchCategories(query: string): Promise<TwitchGame[]> {
    const response = await this.makeRequest<TwitchGamesResponse>('/search/categories', {
      query,
    });
    return response.data;
  }

  async getStreams(gameIds?: string[], userLogins?: string[], first: number = 20): Promise<TwitchStream[]> {
    const params: Record<string, string> = {
      first: first.toString(),
    };

    if (gameIds) {
      gameIds.forEach(id => {
        params[`game_id`] = id;
      });
    }

    if (userLogins) {
      userLogins.forEach(login => {
        params[`user_login`] = login;
      });
    }

    const response = await this.makeRequest<TwitchStreamsResponse>('/streams', params);
    return response.data;
  }

  async getGame(gameId: string): Promise<TwitchGame | null> {
    const response = await this.makeRequest<TwitchGamesResponse>('/games', {
      id: gameId,
    });
    return response.data[0] || null;
  }
}

export const createTwitchClient = () => {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitch API credentials not configured');
  }

  return new TwitchAPIClient(clientId, clientSecret);
};

export type { TwitchStream, TwitchGame };
