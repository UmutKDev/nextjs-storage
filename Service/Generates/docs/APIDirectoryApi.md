# APIDirectoryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create**](#create) | **POST** /Api/v1/Directory | |
|[**deleteDirectory**](#deletedirectory) | **DELETE** /Api/v1/Directory | |

# **create**
> create(directoryCreateRequestModel)


### Example

```typescript
import {
    APIDirectoryApi,
    Configuration,
    DirectoryCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIDirectoryApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let directoryCreateRequestModel: DirectoryCreateRequestModel; //

const { status, data } = await apiInstance.create(
    xApiSecret,
    xApiKey,
    directoryCreateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryCreateRequestModel** | **DirectoryCreateRequestModel**|  | |
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

# **deleteDirectory**
> deleteDirectory(directoryDeleteRequestModel)


### Example

```typescript
import {
    APIDirectoryApi,
    Configuration,
    DirectoryDeleteRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIDirectoryApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let directoryDeleteRequestModel: DirectoryDeleteRequestModel; //

const { status, data } = await apiInstance.deleteDirectory(
    xApiSecret,
    xApiKey,
    directoryDeleteRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryDeleteRequestModel** | **DirectoryDeleteRequestModel**|  | |
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

