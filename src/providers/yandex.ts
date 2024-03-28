import { OAuth2Client } from "oslo/oauth2";
import { TimeSpan, createDate } from "oslo";

import type { OAuth2Provider } from "../index.js";

const authorizeEndpoint = "https://oauth.yandex.com/authorize";
const tokenEndpoint = "https://oauth.yandex.com/token";

export class Yandex implements OAuth2Provider {
	private client: OAuth2Client;
	private clientSecret: string;

	constructor(clientId: string, clientSecret: string, options?: {
        redirectURI: string
    }) {
		this.client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
			redirectURI: options?.redirectURI
		});
		this.clientSecret = clientSecret;
	}

	public async createAuthorizationURL(
		state: string,
		options?: {
			scopes?: string[];
		}
	): Promise<URL> {
		return await this.client.createAuthorizationURL({
			state,
			scopes: options?.scopes ?? [],
		});
	}

	public async validateAuthorizationCode(code: string): Promise<YandexTokens> {
		const result = await this.client.validateAuthorizationCode<TokenResponseBody>(code, {
			credentials: this.clientSecret
		});
		const tokens: YandexTokens = {
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			accessTokenExpiresAt: createDate(new TimeSpan(result.expires_in, "s"))
		};
		return tokens;
	}

	public async refreshAccessToken(refreshToken: string): Promise<YandexTokens> {
		const result = await this.client.refreshAccessToken<TokenResponseBody>(refreshToken, {
			credentials: this.clientSecret
		});
		const tokens: YandexTokens = {
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			accessTokenExpiresAt: createDate(new TimeSpan(result.expires_in, "s"))
		};
		return tokens;
	}
}

interface TokenResponseBody {
	access_token: string;
	expires_in: number;
	refresh_token: string;
}

export interface YandexTokens {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: Date;
}
