# CloudDuplicateFileModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** | Object key (relative, without owner prefix) | [default to undefined]
**Name** | **string** |  | [default to undefined]
**Size** | **number** |  | [default to undefined]
**LastModified** | **string** |  | [optional] [default to undefined]
**MimeType** | **string** |  | [optional] [default to undefined]
**Path** | [**CloudPathModel**](CloudPathModel.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CloudDuplicateFileModel } from './api';

const instance: CloudDuplicateFileModel = {
    Key,
    Name,
    Size,
    LastModified,
    MimeType,
    Path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
