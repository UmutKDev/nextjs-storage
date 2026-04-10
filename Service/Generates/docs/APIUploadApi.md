# APIUploadApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**abortMultipartUpload**](#abortmultipartupload) | **DELETE** /Api/v1/Upload/AbortMultipartUpload | |
|[**completeMultipartUpload**](#completemultipartupload) | **POST** /Api/v1/Upload/CompleteMultipartUpload | |
|[**createMultipartUpload**](#createmultipartupload) | **POST** /Api/v1/Upload/CreateMultipartUpload | |
|[**getMultipartPartUrl**](#getmultipartparturl) | **POST** /Api/v1/Upload/GetMultipartPartUrl | |
|[**getMultipartPartUrls**](#getmultipartparturls) | **POST** /Api/v1/Upload/GetMultipartPartUrls | |

# **abortMultipartUpload**
> abortMultipartUpload(cloudAbortMultipartUploadRequestModel)


### Example

```typescript
import {
    APIUploadApi,
    Configuration,
    CloudAbortMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUploadApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let cloudAbortMultipartUploadRequestModel: CloudAbortMultipartUploadRequestModel; //

const { status, data } = await apiInstance.abortMultipartUpload(
    xApiSecret,
    xApiKey,
    cloudAbortMultipartUploadRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudAbortMultipartUploadRequestModel** | **CloudAbortMultipartUploadRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeMultipartUpload**
> completeMultipartUpload(cloudCompleteMultipartUploadRequestModel)


### Example

```typescript
import {
    APIUploadApi,
    Configuration,
    CloudCompleteMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUploadApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let cloudCompleteMultipartUploadRequestModel: CloudCompleteMultipartUploadRequestModel; //

const { status, data } = await apiInstance.completeMultipartUpload(
    xApiSecret,
    xApiKey,
    idempotencyKey,
    cloudCompleteMultipartUploadRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudCompleteMultipartUploadRequestModel** | **CloudCompleteMultipartUploadRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createMultipartUpload**
> createMultipartUpload(cloudCreateMultipartUploadRequestModel)


### Example

```typescript
import {
    APIUploadApi,
    Configuration,
    CloudCreateMultipartUploadRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUploadApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let cloudCreateMultipartUploadRequestModel: CloudCreateMultipartUploadRequestModel; //

const { status, data } = await apiInstance.createMultipartUpload(
    xApiSecret,
    xApiKey,
    cloudCreateMultipartUploadRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudCreateMultipartUploadRequestModel** | **CloudCreateMultipartUploadRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMultipartPartUrl**
> getMultipartPartUrl(cloudGetMultipartPartUrlRequestModel)


### Example

```typescript
import {
    APIUploadApi,
    Configuration,
    CloudGetMultipartPartUrlRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUploadApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let cloudGetMultipartPartUrlRequestModel: CloudGetMultipartPartUrlRequestModel; //

const { status, data } = await apiInstance.getMultipartPartUrl(
    xApiSecret,
    xApiKey,
    cloudGetMultipartPartUrlRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudGetMultipartPartUrlRequestModel** | **CloudGetMultipartPartUrlRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMultipartPartUrls**
> getMultipartPartUrls(cloudGetMultipartPartUrlsBatchRequestModel)


### Example

```typescript
import {
    APIUploadApi,
    Configuration,
    CloudGetMultipartPartUrlsBatchRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUploadApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let cloudGetMultipartPartUrlsBatchRequestModel: CloudGetMultipartPartUrlsBatchRequestModel; //

const { status, data } = await apiInstance.getMultipartPartUrls(
    xApiSecret,
    xApiKey,
    cloudGetMultipartPartUrlsBatchRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudGetMultipartPartUrlsBatchRequestModel** | **CloudGetMultipartPartUrlsBatchRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

