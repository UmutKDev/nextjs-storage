# CloudArchiveExtractStartRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** | Key of the archive file to extract | [default to undefined]
**SelectedEntries** | **Array&lt;string&gt;** | Specific entry paths to extract (selective extraction). Omit for full extraction. | [optional] [default to undefined]

## Example

```typescript
import { CloudArchiveExtractStartRequestModel } from './api';

const instance: CloudArchiveExtractStartRequestModel = {
    Key,
    SelectedEntries,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
