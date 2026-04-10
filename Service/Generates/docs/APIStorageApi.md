# APIStorageApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /Api/v1/Storage/Delete | |
|[**find**](#find) | **GET** /Api/v1/Storage/Find | |
|[**list**](#list) | **GET** /Api/v1/Storage/List | |
|[**move**](#move) | **PUT** /Api/v1/Storage/Move | |
|[**search**](#search) | **GET** /Api/v1/Storage/Search | |

# **_delete**
> _delete(cloudDeleteRequestModel)


### Example

```typescript
import {
    APIStorageApi,
    Configuration,
    CloudDeleteRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIStorageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let cloudDeleteRequestModel: CloudDeleteRequestModel; //

const { status, data } = await apiInstance._delete(
    xApiSecret,
    xApiKey,
    idempotencyKey,
    cloudDeleteRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudDeleteRequestModel** | **CloudDeleteRequestModel**|  | |
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **find**
> find()


### Example

```typescript
import {
    APIStorageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIStorageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let key: string; // (default to undefined)

const { status, data } = await apiInstance.find(
    xApiSecret,
    xApiKey,
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **key** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list**
> list()


### Example

```typescript
import {
    APIStorageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIStorageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; // (optional) (default to undefined)
let delimiter: boolean; // (optional) (default to undefined)
let isMetadataProcessing: boolean; // (optional) (default to true)

const { status, data } = await apiInstance.list(
    xApiSecret,
    xApiKey,
    search,
    skip,
    take,
    path,
    delimiter,
    isMetadataProcessing
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|
| **delimiter** | [**boolean**] |  | (optional) defaults to undefined|
| **isMetadataProcessing** | [**boolean**] |  | (optional) defaults to true|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **move**
> move(cloudMoveRequestModel)


### Example

```typescript
import {
    APIStorageApi,
    Configuration,
    CloudMoveRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIStorageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let cloudMoveRequestModel: CloudMoveRequestModel; //

const { status, data } = await apiInstance.move(
    xApiSecret,
    xApiKey,
    idempotencyKey,
    cloudMoveRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudMoveRequestModel** | **CloudMoveRequestModel**|  | |
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search**
> search()


### Example

```typescript
import {
    APIStorageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIStorageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let query: string; //Search query - partial filename match (case-insensitive, min 2 chars) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; //Restrict search to a specific directory path (optional) (default to undefined)
let extension: string; //Filter by file extension (e.g. \"pdf\", \"jpg\"). Without leading dot. (optional) (default to undefined)
let isMetadataProcessing: boolean; // (optional) (default to false)

const { status, data } = await apiInstance.search(
    xApiSecret,
    xApiKey,
    query,
    search,
    skip,
    take,
    path,
    extension,
    isMetadataProcessing
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **query** | [**string**] | Search query - partial filename match (case-insensitive, min 2 chars) | defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] | Restrict search to a specific directory path | (optional) defaults to undefined|
| **extension** | [**string**] | Filter by file extension (e.g. \&quot;pdf\&quot;, \&quot;jpg\&quot;). Without leading dot. | (optional) defaults to undefined|
| **isMetadataProcessing** | [**boolean**] |  | (optional) defaults to false|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

