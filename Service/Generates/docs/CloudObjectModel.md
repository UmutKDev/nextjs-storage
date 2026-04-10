# CloudObjectModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | [default to undefined]
**Extension** | **string** |  | [default to undefined]
**MimeType** | **string** |  | [default to undefined]
**Path** | [**CloudPathModel**](CloudPathModel.md) |  | [default to undefined]
**Metadata** | [**CloudMetadataDefaultModel**](CloudMetadataDefaultModel.md) |  | [optional] [default to undefined]
**LastModified** | **string** |  | [default to undefined]
**ETag** | **string** |  | [default to undefined]
**Size** | **number** |  | [default to undefined]

## Example

```typescript
import { CloudObjectModel } from './api';

const instance: CloudObjectModel = {
    Name,
    Extension,
    MimeType,
    Path,
    Metadata,
    LastModified,
    ETag,
    Size,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
