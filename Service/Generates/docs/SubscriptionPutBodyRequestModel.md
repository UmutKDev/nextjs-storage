# SubscriptionPutBodyRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | [default to undefined]
**Description** | **string** |  | [optional] [default to undefined]
**Price** | **number** | Price in cents | [default to undefined]
**Currency** | **string** |  | [default to 'USD']
**BillingCycle** | **string** |  | [default to undefined]
**StorageLimitBytes** | **number** | Storage limit in bytes - 0 means unlimited | [default to undefined]
**MaxObjectCount** | **number** |  | [optional] [default to undefined]
**Features** | **object** |  | [optional] [default to undefined]
**Status** | **string** |  | [default to undefined]

## Example

```typescript
import { SubscriptionPutBodyRequestModel } from './api';

const instance: SubscriptionPutBodyRequestModel = {
    Name,
    Description,
    Price,
    Currency,
    BillingCycle,
    StorageLimitBytes,
    MaxObjectCount,
    Features,
    Status,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
