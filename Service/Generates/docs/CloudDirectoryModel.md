# CloudDirectoryModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | [default to undefined]
**Prefix** | **string** |  | [default to undefined]
**IsEncrypted** | **boolean** |  | [default to false]
**IsLocked** | **boolean** | True if encrypted folder is locked (no valid session) | [default to true]
**IsHidden** | **boolean** | Whether directory is hidden | [default to false]
**IsConcealed** | **boolean** | True if hidden folder is concealed (no valid hidden session) | [default to true]
**Thumbnails** | [**Array&lt;CloudObjectModel&gt;**](CloudObjectModel.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CloudDirectoryModel } from './api';

const instance: CloudDirectoryModel = {
    Name,
    Prefix,
    IsEncrypted,
    IsLocked,
    IsHidden,
    IsConcealed,
    Thumbnails,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
