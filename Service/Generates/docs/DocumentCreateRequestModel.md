# DocumentCreateRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Directory path (e.g., \&quot;documents/\&quot;) | [default to undefined]
**Name** | **string** | Filename with extension (e.g., \&quot;readme.md\&quot;) | [default to undefined]
**Content** | **string** | Initial document content | [optional] [default to undefined]
**ConflictStrategy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { DocumentCreateRequestModel } from './api';

const instance: DocumentCreateRequestModel = {
    Path,
    Name,
    Content,
    ConflictStrategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
