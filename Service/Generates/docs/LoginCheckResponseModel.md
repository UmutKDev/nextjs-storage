# LoginCheckResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HasPasskey** | **boolean** | Whether the user has passkey(s) registered | [default to undefined]
**HasTwoFactor** | **boolean** | Whether the user has 2FA enabled | [default to undefined]
**TwoFactorMethod** | **string** | 2FA method if enabled (TOTP, etc.) | [default to undefined]
**AvailableMethods** | **Array&lt;string&gt;** | Available authentication methods | [default to undefined]
**PasskeyOptions** | **object** | Passkey login options if passkey is available | [optional] [default to undefined]

## Example

```typescript
import { LoginCheckResponseModel } from './api';

const instance: LoginCheckResponseModel = {
    HasPasskey,
    HasTwoFactor,
    TwoFactorMethod,
    AvailableMethods,
    PasskeyOptions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
