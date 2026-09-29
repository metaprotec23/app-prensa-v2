export type OrganizationType = 'MUNICIPALITY' | 'COMPANY';

export interface AuthUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthRoleSummary {
  id: string;
  name: string;
  description: string | null;
}

export interface AuthOrganizationSummary {
  id: string;
  name: string;
  type: OrganizationType;
  logoUrl: string | null;
  isActive: boolean;
}

export interface AuthMembershipSummary {
  organization: AuthOrganizationSummary;
  roles: AuthRoleSummary[];
  permissions: string[];
}

export interface AuthMeResponse {
  user: AuthUserSummary;
  memberships: AuthMembershipSummary[];
  activeOrganizationId: string | null;
  activeRoleNames: string[];
  activePermissions: string[];
  hasTwoFactorEnabled: boolean;
}

export interface AuthenticatedResponse {
  status: 'authenticated';
}

export interface TwoFactorRequiredResponse {
  status: 'requires_2fa';
  twoFactorToken: string;
}

export type LoginResponse = AuthenticatedResponse | TwoFactorRequiredResponse;

export interface SimpleStatusResponse {
  status: string;
}

export interface TotpSetupResponse {
  status: 'pending_verification';
  qrCodeDataUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}
