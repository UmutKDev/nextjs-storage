# CloudArchiveCreateStartRequestModel


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Keys** | **Array&lt;string&gt;** | S3 keys to include in the archive (files and/or directories) | [default to undefined]
**Format** | **string** | Output format | [optional] [default to FormatEnum_Zip]
**OutputName** | **string** | Custom output filename (without extension) | [optional] [default to undefined]

## Example

```typescript
import { CloudArchiveCreateStartRequestModel } from './api';

const instance: CloudArchiveCreateStartRequestModel = {
    Keys,
    Format,
    OutputName,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
