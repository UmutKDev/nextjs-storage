# DocumentUpdateContentRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** |  | [default to undefined]
**Content** | **string** | Full document content | [default to undefined]
**ExpectedContentHash** | **string** | SHA-256 hash of the content the client last read. If provided, the server will reject updates where the current content has changed (optimistic concurrency). | [optional] [default to undefined]

## Example

```typescript
import { DocumentUpdateContentRequestModel } from './api';

const instance: DocumentUpdateContentRequestModel = {
    Key,
    Content,
    ExpectedContentHash,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
