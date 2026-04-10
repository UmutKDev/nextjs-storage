# CloudDuplicateScanStartRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Folder path to scan for duplicates | [default to undefined]
**Recursive** | **boolean** | Whether to scan subdirectories recursively | [optional] [default to true]
**SimilarityThreshold** | **number** | Similarity threshold percentage for image perceptual hashing (1-100) | [optional] [default to 95]

## Example

```typescript
import { CloudDuplicateScanStartRequestModel } from './api';

const instance: CloudDuplicateScanStartRequestModel = {
    Path,
    Recursive,
    SimilarityThreshold,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
