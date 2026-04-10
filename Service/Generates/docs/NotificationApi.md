# NotificationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**history**](#history) | **GET** /Api/v1/Notification/History | |
|[**markAllAsRead**](#markallasread) | **PATCH** /Api/v1/Notification/ReadAll | |
|[**markAsRead**](#markasread) | **PATCH** /Api/v1/Notification/{Id}/Read | |
|[**unreadCount**](#unreadcount) | **GET** /Api/v1/Notification/UnreadCount | |

# **history**
> history()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.history(
    search,
    skip,
    take
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **markAllAsRead**
> markAllAsRead()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.markAllAsRead();
```

### Parameters
This endpoint does not have any parameters.


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

# **markAsRead**
> markAsRead()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.markAsRead(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **unreadCount**
> unreadCount()


### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.unreadCount();
```

### Parameters
This endpoint does not have any parameters.


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

