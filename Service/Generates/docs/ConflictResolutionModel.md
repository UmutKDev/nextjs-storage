# ConflictResolutionModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Strategy** | **string** | Global strategy applied to all conflicts. Default: FAIL (return 409) | [optional] [default to undefined]
**Items** | [**Array&lt;ConflictResolutionItemModel&gt;**](ConflictResolutionItemModel.md) | Per-item strategy overrides. Key matches the source item key. | [optional] [default to undefined]

## Example

```typescript
import { ConflictResolutionModel } from './api';

const instance: ConflictResolutionModel = {
    Strategy,
    Items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
