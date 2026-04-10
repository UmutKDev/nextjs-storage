# CloudUploadApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**uploadAbortMultipartUpload**](#uploadabortmultipartupload) | **DELETE** /Api/Cloud/Upload/AbortMultipartUpload | Abort a multipart upload|
|[**uploadCompleteMultipartUpload**](#uploadcompletemultipartupload) | **POST** /Api/Cloud/Upload/CompleteMultipartUpload | Complete multipart upload|
|[**uploadCreateMultipartUpload**](#uploadcreatemultipartupload) | **POST** /Api/Cloud/Upload/CreateMultipartUpload | Create a multipart upload session|
|[**uploadGetMultipartPartUrl**](#uploadgetmultipartparturl) | **POST** /Api/Cloud/Upload/GetMultipartPartUrl | Get a multipart upload part URL|
|[**uploadGetMultipartPartUrlsBatch**](#uploadgetmultipartparturlsbatch) | **POST** /Api/Cloud/Upload/GetMultipartPartUrls | Get multipart upload part URLs in batch|
|[**uploadPart**](#uploadpart) | **POST** /Api/Cloud/Upload/UploadPart | Upload a multipart part|

# **uploadAbortMultipartUpload**
> uploadAbortMultipartUpload(cloudAbortMultipartUploadRequestModel)

Abort an ongoing multipart upload and clean up temporary state.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration,
    CloudAbortMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let cloudAbortMultipartUploadRequestModel: CloudAbortMultipartUploadRequestModel; //
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.uploadAbortMultipartUpload(
    cloudAbortMultipartUploadRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudAbortMultipartUploadRequestModel** | **CloudAbortMultipartUploadRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadCompleteMultipartUpload**
> CloudCompleteMultipartUploadResponseBaseModel uploadCompleteMultipartUpload(cloudCompleteMultipartUploadRequestModel)

Completes a multipart upload by providing the list of parts and finalizes the object.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration,
    CloudCompleteMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let idempotencyKey: string; // (default to undefined)
let cloudCompleteMultipartUploadRequestModel: CloudCompleteMultipartUploadRequestModel; //
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.uploadCompleteMultipartUpload(
    idempotencyKey,
    cloudCompleteMultipartUploadRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudCompleteMultipartUploadRequestModel** | **CloudCompleteMultipartUploadRequestModel**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudCompleteMultipartUploadResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadCreateMultipartUpload**
> CloudCreateMultipartUploadResponseBaseModel uploadCreateMultipartUpload(cloudCreateMultipartUploadRequestModel)

Creates an UploadId and starts a multipart upload flow.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration,
    CloudCreateMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let cloudCreateMultipartUploadRequestModel: CloudCreateMultipartUploadRequestModel; //
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.uploadCreateMultipartUpload(
    cloudCreateMultipartUploadRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudCreateMultipartUploadRequestModel** | **CloudCreateMultipartUploadRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudCreateMultipartUploadResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**409** | Conflict detected — file already exists at target key |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadGetMultipartPartUrl**
> CloudGetMultipartPartUrlResponseBaseModel uploadGetMultipartPartUrl(cloudGetMultipartPartUrlRequestModel)

Returns an expiring URL to upload a single part for the provided UploadId and PartNumber.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration,
    CloudGetMultipartPartUrlRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let cloudGetMultipartPartUrlRequestModel: CloudGetMultipartPartUrlRequestModel; //
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.uploadGetMultipartPartUrl(
    cloudGetMultipartPartUrlRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudGetMultipartPartUrlRequestModel** | **CloudGetMultipartPartUrlRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudGetMultipartPartUrlResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadGetMultipartPartUrlsBatch**
> CloudGetMultipartPartUrlsBatchResponseBaseModel uploadGetMultipartPartUrlsBatch(cloudGetMultipartPartUrlsBatchRequestModel)

Returns expiring URLs for multiple parts at once. Accepts either TotalParts or specific PartNumbers.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration,
    CloudGetMultipartPartUrlsBatchRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let cloudGetMultipartPartUrlsBatchRequestModel: CloudGetMultipartPartUrlsBatchRequestModel; //
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.uploadGetMultipartPartUrlsBatch(
    cloudGetMultipartPartUrlsBatchRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudGetMultipartPartUrlsBatchRequestModel** | **CloudGetMultipartPartUrlsBatchRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudGetMultipartPartUrlsBatchResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadPart**
> CloudUploadPartResponseBaseModel uploadPart()

Accepts a single file part for a multipart upload. The request must be multipart/form-data.

### Example

```typescript
import {
    CloudUploadApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUploadApi(configuration);

let contentMd5: string; // (default to undefined)
let key: string; // (default to undefined)
let uploadId: string; // (default to undefined)
let partNumber: number; // (default to undefined)
let file: File; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, uploads target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.uploadPart(
    contentMd5,
    key,
    uploadId,
    partNumber,
    file,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentMd5** | [**string**] |  | defaults to undefined|
| **key** | [**string**] |  | defaults to undefined|
| **uploadId** | [**string**] |  | defaults to undefined|
| **partNumber** | [**number**] |  | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, uploads target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudUploadPartResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

