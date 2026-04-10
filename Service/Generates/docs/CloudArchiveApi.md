# CloudArchiveApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**archiveCreateCancel**](#archivecreatecancel) | **POST** /Api/Cloud/Archive/Create/Cancel | Cancel archive creation|
|[**archiveCreateStart**](#archivecreatestart) | **POST** /Api/Cloud/Archive/Create/Start | Start archive creation|
|[**archiveExtractCancel**](#archiveextractcancel) | **POST** /Api/Cloud/Archive/Extract/Cancel | Cancel archive extraction|
|[**archiveExtractStart**](#archiveextractstart) | **POST** /Api/Cloud/Archive/Extract/Start | Start archive extraction|
|[**archivePreview**](#archivepreview) | **GET** /Api/Cloud/Archive/Preview | Preview archive contents|

# **archiveCreateCancel**
> CloudArchiveCreateCancelResponseBaseModel archiveCreateCancel(cloudArchiveCreateCancelRequestModel)

Cancels an archive creation job if it is pending or running.

### Example

```typescript
import {
    CloudArchiveApi,
    Configuration,
    CloudArchiveCreateCancelRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudArchiveApi(configuration);

let cloudArchiveCreateCancelRequestModel: CloudArchiveCreateCancelRequestModel; //
let xTeamId: string; //Optional team ID. When provided, archive operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.archiveCreateCancel(
    cloudArchiveCreateCancelRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudArchiveCreateCancelRequestModel** | **CloudArchiveCreateCancelRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, archive operations target the team storage. | (optional) defaults to undefined|


### Return type

**CloudArchiveCreateCancelResponseBaseModel**

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

# **archiveCreateStart**
> CloudArchiveCreateStartResponseBaseModel archiveCreateStart(cloudArchiveCreateStartRequestModel)

Creates a .zip, .tar, or .tar.gz archive from the given keys (files and/or directories). Returns a job ID. Progress and completion are pushed via WebSocket notifications.

### Example

```typescript
import {
    CloudArchiveApi,
    Configuration,
    CloudArchiveCreateStartRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudArchiveApi(configuration);

let cloudArchiveCreateStartRequestModel: CloudArchiveCreateStartRequestModel; //
let xTeamId: string; //Optional team ID. When provided, archive operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.archiveCreateStart(
    cloudArchiveCreateStartRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudArchiveCreateStartRequestModel** | **CloudArchiveCreateStartRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, archive operations target the team storage. | (optional) defaults to undefined|


### Return type

**CloudArchiveCreateStartResponseBaseModel**

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

# **archiveExtractCancel**
> CloudArchiveExtractCancelResponseBaseModel archiveExtractCancel(cloudArchiveExtractCancelRequestModel)

Cancels an archive extraction job if it is pending or running.

### Example

```typescript
import {
    CloudArchiveApi,
    Configuration,
    CloudArchiveExtractCancelRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudArchiveApi(configuration);

let cloudArchiveExtractCancelRequestModel: CloudArchiveExtractCancelRequestModel; //
let xTeamId: string; //Optional team ID. When provided, archive operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.archiveExtractCancel(
    cloudArchiveExtractCancelRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudArchiveExtractCancelRequestModel** | **CloudArchiveExtractCancelRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, archive operations target the team storage. | (optional) defaults to undefined|


### Return type

**CloudArchiveExtractCancelResponseBaseModel**

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

# **archiveExtractStart**
> CloudArchiveExtractStartResponseBaseModel archiveExtractStart(cloudArchiveExtractStartRequestModel)

Starts an async job to extract a .zip, .tar, .tar.gz, or .rar archive. Optionally provide SelectedEntries for selective extraction. Progress and completion are pushed via WebSocket notifications.

### Example

```typescript
import {
    CloudArchiveApi,
    Configuration,
    CloudArchiveExtractStartRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudArchiveApi(configuration);

let cloudArchiveExtractStartRequestModel: CloudArchiveExtractStartRequestModel; //
let xTeamId: string; //Optional team ID. When provided, archive operations target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.archiveExtractStart(
    cloudArchiveExtractStartRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudArchiveExtractStartRequestModel** | **CloudArchiveExtractStartRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, archive operations target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudArchiveExtractStartResponseBaseModel**

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

# **archivePreview**
> CloudArchivePreviewResponseBaseModel archivePreview()

Lists entries of an archive file without extracting. Supports .zip, .tar, .tar.gz, and .rar.

### Example

```typescript
import {
    CloudArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudArchiveApi(configuration);

let key: string; //Key of the archive file to preview (default to undefined)
let xTeamId: string; //Optional team ID. When provided, archive operations target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.archivePreview(
    key,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] | Key of the archive file to preview | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, archive operations target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudArchivePreviewResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

