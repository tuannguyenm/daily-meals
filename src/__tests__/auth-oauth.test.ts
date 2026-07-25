import {hasProviderIdentity,oauthErrorMessage,parseOAuthRedirect} from '../auth-oauth';

describe('OAuth account linking helpers',()=>{
 it('extracts the PKCE code from the app callback',()=>{
  expect(parseOAuthRedirect('dailymeals://auth/callback?code=pkce-code')).toEqual({code:'pkce-code'});
 });

 it('surfaces OAuth errors and missing codes',()=>{
  expect(()=>parseOAuthRedirect('dailymeals://auth/callback?error=access_denied&error_description=Ng%C6%B0%E1%BB%9Di+d%C3%B9ng+t%E1%BB%AB+ch%E1%BB%91i')).toThrow('Người dùng từ chối');
  expect(()=>parseOAuthRedirect('dailymeals://auth/callback')).toThrow('Google không trả về mã xác thực');
 });

 it('verifies that Google was actually linked',()=>{
  expect(hasProviderIdentity([{provider:'email'},{provider:'google'}],'google')).toBe(true);
  expect(hasProviderIdentity([{provider:'email'}],'google')).toBe(false);
 });

 it('maps Supabase configuration errors to actionable Vietnamese messages',()=>{
  expect(oauthErrorMessage(new Error('Manual linking is disabled'))).toBe('Liên kết tài khoản chưa được bật trong Supabase.');
  expect(oauthErrorMessage(new Error('Unsupported provider: google'))).toBe('Google Sign-In chưa được cấu hình trong Supabase.');
 });
});
