export type OAuthProvider='google';

export interface OAuthRedirectPayload{
 code:string;
}

export function parseOAuthRedirect(url:string):OAuthRedirectPayload{
 const parsed=new URL(url);
 const oauthError=parsed.searchParams.get('error_description')??parsed.searchParams.get('error');
 if(oauthError)throw new Error(decodeURIComponent(oauthError.replace(/\+/g,' ')));
 const code=parsed.searchParams.get('code');
 if(!code)throw new Error('Google không trả về mã xác thực. Vui lòng thử lại.');
 return{code};
}

export function hasProviderIdentity(
 identities:readonly {provider?:string|null}[],
 provider:OAuthProvider,
){
 return identities.some(identity=>identity.provider===provider);
}

export function oauthErrorMessage(reason:unknown){
 const message=reason instanceof Error?reason.message:String(reason);
 if(/manual linking|identity linking.*disabled/i.test(message))return'Liên kết tài khoản chưa được bật trong Supabase.';
 if(/provider.*not enabled|unsupported provider/i.test(message))return'Google Sign-In chưa được cấu hình trong Supabase.';
 if(/identity.*already.*linked|already been registered|already exists/i.test(message))return'Tài khoản Google này đã được liên kết với một người dùng khác.';
 if(/network|fetch|offline/i.test(message))return'Không thể kết nối Google. Hãy kiểm tra mạng và thử lại.';
 return message||'Không thể liên kết tài khoản Google.';
}
