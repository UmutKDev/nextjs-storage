# DirectoryUnlockResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Directory path that was requested for unlock | [default to undefined]
**EncryptedFolderPath** | **string** | The root encrypted folder path (parent folder that is actually encrypted) | [default to undefined]
**SessionToken** | **string** | Session token for subsequent requests. Pass via X-Folder-Session header. | [default to undefined]
**ExpiresAt** | **number** | Session expiration timestamp (Unix epoch in seconds) | [default to undefined]
**TTL** | **number** | Session TTL in seconds | [default to undefined]

## Example

```typescript
import { DirectoryUnlockResponseModel } from './api';

const instance: DirectoryUnlockResponseModel = {
    Path,
    EncryptedFolderPath,
    SessionToken,
    ExpiresAt,
    TTL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
