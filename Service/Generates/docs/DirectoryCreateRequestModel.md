# DirectoryCreateRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Directory path to create | [default to undefined]
**IsEncrypted** | **boolean** | Create as encrypted directory | [optional] [default to false]
**ConflictStrategy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { DirectoryCreateRequestModel } from './api';

const instance: DirectoryCreateRequestModel = {
    Path,
    IsEncrypted,
    ConflictStrategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
