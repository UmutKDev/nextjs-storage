# APIWebhooksApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create**](#create) | **POST** /Api/v1/Webhooks | |
|[**deliveries**](#deliveries) | **GET** /Api/v1/Webhooks/{Id}/Deliveries | |
|[**findById**](#findbyid) | **GET** /Api/v1/Webhooks/{Id} | |
|[**list**](#list) | **GET** /Api/v1/Webhooks | |
|[**remove**](#remove) | **DELETE** /Api/v1/Webhooks/{Id} | |
|[**test**](#test) | **POST** /Api/v1/Webhooks/{Id}/Test | |
|[**update**](#update) | **PUT** /Api/v1/Webhooks/{Id} | |

# **create**
> create(webhookCreateRequestModel)


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration,
    WebhookCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let webhookCreateRequestModel: WebhookCreateRequestModel; //

const { status, data } = await apiInstance.create(
    xApiSecret,
    xApiKey,
    webhookCreateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **webhookCreateRequestModel** | **WebhookCreateRequestModel**|  | |
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

# **deliveries**
> deliveries()


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let id: string; // (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.deliveries(
    xApiSecret,
    xApiKey,
    id,
    search,
    skip,
    take
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|


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

# **findById**
> findById()


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.findById(
    xApiSecret,
    xApiKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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
    APIWebhooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)

const { status, data } = await apiInstance.list(
    xApiSecret,
    xApiKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|


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

# **remove**
> remove()


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.remove(
    xApiSecret,
    xApiKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

# **test**
> test()


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.test(
    xApiSecret,
    xApiKey,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update**
> update(webhookUpdateRequestModel)


### Example

```typescript
import {
    APIWebhooksApi,
    Configuration,
    WebhookUpdateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new APIWebhooksApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)
let id: string; // (default to undefined)
let webhookUpdateRequestModel: WebhookUpdateRequestModel; //

const { status, data } = await apiInstance.update(
    xApiSecret,
    xApiKey,
    id,
    webhookUpdateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **webhookUpdateRequestModel** | **WebhookUpdateRequestModel**|  | |
| **xApiSecret** | [**string**] |  | defaults to undefined|
| **xApiKey** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


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

