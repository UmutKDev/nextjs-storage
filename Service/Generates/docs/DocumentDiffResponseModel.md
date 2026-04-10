# DocumentDiffResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** |  | [default to undefined]
**SourceVersionId** | **string** |  | [default to undefined]
**TargetVersionId** | **string** |  | [default to undefined]
**Hunks** | [**Array&lt;DocumentDiffHunkModel&gt;**](DocumentDiffHunkModel.md) |  | [default to undefined]
**Stats** | [**DocumentDiffStatsModel**](DocumentDiffStatsModel.md) |  | [default to undefined]

## Example

```typescript
import { DocumentDiffResponseModel } from './api';

const instance: DocumentDiffResponseModel = {
    Key,
    SourceVersionId,
    TargetVersionId,
    Hunks,
    Stats,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
