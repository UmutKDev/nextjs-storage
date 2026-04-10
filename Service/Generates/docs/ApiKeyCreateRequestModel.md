# ApiKeyCreateRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | [default to undefined]
**Scopes** | **Array&lt;string&gt;** |  | [default to undefined]
**Environment** | **string** |  | [default to undefined]
**IpWhitelist** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**RateLimitPerMinute** | **number** |  | [optional] [default to undefined]
**ExpiresAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ApiKeyCreateRequestModel } from './api';

const instance: ApiKeyCreateRequestModel = {
    Name,
    Scopes,
    Environment,
    IpWhitelist,
    RateLimitPerMinute,
    ExpiresAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
