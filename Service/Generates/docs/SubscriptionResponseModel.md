# SubscriptionResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | [default to undefined]
**Name** | **string** |  | [default to undefined]
**Slug** | **string** |  | [default to undefined]
**Description** | **string** |  | [optional] [default to undefined]
**Currency** | **string** |  | [default to 'USD']
**BillingCycle** | **string** |  | [default to undefined]
**StorageLimitBytes** | **number** | Storage limit in bytes - 0 means unlimited | [default to undefined]
**MaxObjectCount** | **number** |  | [optional] [default to undefined]
**Features** | **object** |  | [optional] [default to undefined]
**Status** | **string** |  | [default to undefined]
**Date** | [**SubscriptionDateModel**](SubscriptionDateModel.md) |  | [default to undefined]

## Example

```typescript
import { SubscriptionResponseModel } from './api';

const instance: SubscriptionResponseModel = {
    Id,
    Name,
    Slug,
    Description,
    Currency,
    BillingCycle,
    StorageLimitBytes,
    MaxObjectCount,
    Features,
    Status,
    Date,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
