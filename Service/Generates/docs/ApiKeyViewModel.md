# ApiKeyViewModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | [default to undefined]
**Name** | **string** |  | [default to undefined]
**PublicKey** | **string** |  | [default to undefined]
**SecretKeyPrefix** | **string** | First 8 characters of secret key | [default to undefined]
**Environment** | **string** |  | [default to undefined]
**Scopes** | **Array&lt;string&gt;** |  | [default to undefined]
**IpWhitelist** | **Array&lt;string&gt;** |  | [default to undefined]
**RateLimitPerMinute** | **number** |  | [default to undefined]
**LastUsedAt** | **string** |  | [default to undefined]
**ExpiresAt** | **string** |  | [default to undefined]
**IsRevoked** | **boolean** |  | [default to undefined]
**CreatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ApiKeyViewModel } from './api';

const instance: ApiKeyViewModel = {
    Id,
    Name,
    PublicKey,
    SecretKeyPrefix,
    Environment,
    Scopes,
    IpWhitelist,
    RateLimitPerMinute,
    LastUsedAt,
    ExpiresAt,
    IsRevoked,
    CreatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
