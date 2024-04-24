import { OAuth2Client } from "oslo/oauth2";

import type { OAuth2Provider } from "../index.js";

export class FortyTwo implements OAuth2Provider {
	private client: OAuth2Client;
	private clientSecret: string;

	constructor(
		clientId: string,
		clientSecret: string,
		options?: {
			redirectURI?: string;
		}
	) {
		const baseUrl = "https://api.intra.42.fr";

		const authorizeEndpoint = baseUrl + "/oauth/authorize";
		const tokenEndpoint = baseUrl + "/oauth/token";

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
			scopes: options?.scopes ?? []
		});
	}

	public async validateAuthorizationCode(code: string): Promise<FortyTwoTokens> {
		const result = await this.client.validateAuthorizationCode(code, {
			authenticateWith: "request_body",
			credentials: this.clientSecret
		});
		const tokens: FortyTwoTokens = {
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			expiresIn: result.expires_in,
			scope: result.scope,
			tokenType: result.token_type
		};
		return tokens;
	}
}

export interface FortyTwoTokens {
	accessToken: string;
	refreshToken?: string | null;
	expiresIn?: number;
	tokenType?: string;
	scope?: string;
}
