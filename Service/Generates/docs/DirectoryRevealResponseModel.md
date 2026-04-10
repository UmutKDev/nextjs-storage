# DirectoryRevealResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Directory path that was requested for reveal | [default to undefined]
**HiddenFolderPath** | **string** | The hidden folder path that was revealed | [default to undefined]
**SessionToken** | **string** | Session token for subsequent requests. Pass via X-Hidden-Session header. | [default to undefined]
**ExpiresAt** | **number** | Session expiration timestamp (Unix epoch in seconds) | [default to undefined]
**TTL** | **number** | Session TTL in seconds | [default to undefined]

## Example

```typescript
import { DirectoryRevealResponseModel } from './api';

const instance: DirectoryRevealResponseModel = {
    Path,
    HiddenFolderPath,
    SessionToken,
    ExpiresAt,
    TTL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
