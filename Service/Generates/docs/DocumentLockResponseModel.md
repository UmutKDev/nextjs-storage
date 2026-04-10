# DocumentLockResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** |  | [default to undefined]
**LockStatus** | **string** |  | [default to undefined]
**LockedBy** | **string** |  | [default to undefined]
**LockedByName** | **string** |  | [default to undefined]
**ExpiresAt** | **number** | Unix epoch seconds when lock expires | [default to undefined]
**TTL** | **number** | Seconds remaining until lock expires | [default to undefined]

## Example

```typescript
import { DocumentLockResponseModel } from './api';

const instance: DocumentLockResponseModel = {
    Key,
    LockStatus,
    LockedBy,
    LockedByName,
    ExpiresAt,
    TTL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
