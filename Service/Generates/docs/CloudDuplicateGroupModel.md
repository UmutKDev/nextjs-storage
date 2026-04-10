# CloudDuplicateGroupModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**GroupId** | **string** | Unique identifier for this duplicate group | [default to undefined]
**MatchType** | **string** | Type of duplicate detection: \&quot;exact\&quot; or \&quot;similar\&quot; | [default to undefined]
**Similarity** | **number** | Similarity percentage (100 for exact match, &lt;100 for perceptual) | [default to undefined]
**Files** | [**Array&lt;CloudDuplicateFileModel&gt;**](CloudDuplicateFileModel.md) |  | [default to undefined]
**PotentialSavingsBytes** | **number** | Total bytes that could be reclaimed by removing duplicates | [default to undefined]

## Example

```typescript
import { CloudDuplicateGroupModel } from './api';

const instance: CloudDuplicateGroupModel = {
    GroupId,
    MatchType,
    Similarity,
    Files,
    PotentialSavingsBytes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
