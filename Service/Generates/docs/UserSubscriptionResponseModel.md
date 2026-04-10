# UserSubscriptionResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | [default to undefined]
**StartAt** | **string** |  | [default to undefined]
**EndAt** | **string** |  | [optional] [default to undefined]
**IsTrial** | **boolean** |  | [default to undefined]
**Price** | **number** | Price as cents | [default to undefined]
**Currency** | **string** |  | [optional] [default to undefined]
**Subscription** | [**SubscriptionResponseModel**](SubscriptionResponseModel.md) |  | [optional] [default to undefined]
**Date** | [**BaseDateModel**](BaseDateModel.md) |  | [default to undefined]

## Example

```typescript
import { UserSubscriptionResponseModel } from './api';

const instance: UserSubscriptionResponseModel = {
    Id,
    StartAt,
    EndAt,
    IsTrial,
    Price,
    Currency,
    Subscription,
    Date,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
