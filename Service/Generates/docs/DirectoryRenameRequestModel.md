# DirectoryRenameRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Current directory path | [default to undefined]
**Name** | **string** | New directory name (not full path) | [default to undefined]
**ConflictStrategy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { DirectoryRenameRequestModel } from './api';

const instance: DirectoryRenameRequestModel = {
    Path,
    Name,
    ConflictStrategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
