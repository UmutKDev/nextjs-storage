# CloudDuplicateScanResultResponseModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ScanId** | **string** |  | [default to undefined]
**Status** | **string** |  | [default to undefined]
**TotalFilesScanned** | **number** |  | [default to undefined]
**TotalDuplicateGroups** | **number** |  | [default to undefined]
**TotalPotentialSavingsBytes** | **number** |  | [default to undefined]
**Groups** | [**Array&lt;CloudDuplicateGroupModel&gt;**](CloudDuplicateGroupModel.md) |  | [default to undefined]
**ScannedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CloudDuplicateScanResultResponseModel } from './api';

const instance: CloudDuplicateScanResultResponseModel = {
    ScanId,
    Status,
    TotalFilesScanned,
    TotalDuplicateGroups,
    TotalPotentialSavingsBytes,
    Groups,
    ScannedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
