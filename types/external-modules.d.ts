declare module "@simplewebauthn/browser" {
  export function browserSupportsWebAuthn(): boolean;
  export function browserSupportsWebAuthnAutofill(): Promise<boolean>;
  // Options come from the server API as generic objects
  export function startRegistration(
    options: object,
  ): Promise<RegistrationResponseJSON>;
  export function startAuthentication(
    options: object,
    useBrowserAutofill?: boolean,
  ): Promise<AuthenticationResponseJSON>;

  // WebAuthn response types
  interface RegistrationResponseJSON {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      attestationObject: string;
      transports?: string[];
    };
    type: string;
    clientExtensionResults: Record<string, unknown>;
  }

  interface AuthenticationResponseJSON {
    id: string;
    rawId: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle?: string;
    };
    type: string;
    clientExtensionResults: Record<string, unknown>;
  }
}

declare module "qrcode.react" {
  import * as React from "react";
  export const QRCodeCanvas: React.FC<{ value: string; size?: number }>;
  export const QRCodeSVG: React.FC<{ value: string; size?: number }>;
}
