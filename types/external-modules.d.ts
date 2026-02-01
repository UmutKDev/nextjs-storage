declare module "@simplewebauthn/browser" {
  export function browserSupportsWebAuthn(): boolean;
  export function startRegistration(options: any): Promise<any>;
  export function startAuthentication(options: any): Promise<any>;
}

declare module "qrcode.react" {
  import * as React from "react";
  export const QRCodeCanvas: React.FC<{ value: string; size?: number }>;
  export const QRCodeSVG: React.FC<{ value: string; size?: number }>;
}
