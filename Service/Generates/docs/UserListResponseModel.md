# UserListResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | [default to undefined]
**Email** | **string** |  | [default to undefined]
**FullName** | **string** |  | [default to undefined]
**PhoneNumber** | **string** |  | [default to undefined]
**Image** | **string** |  | [default to undefined]
**Role** | **string** |  | [default to RoleEnum_User]
**Status** | **string** |  | [default to undefined]
**Subscription** | [**UserSubscriptionResponseModel**](UserSubscriptionResponseModel.md) |  | [default to undefined]
**Date** | [**UserDateModel**](UserDateModel.md) |  | [default to undefined]

## Example

```typescript
import { UserListResponseModel } from './api';

const instance: UserListResponseModel = {
    Id,
    Email,
    FullName,
    PhoneNumber,
    Image,
    Role,
    Status,
    Subscription,
    Date,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
