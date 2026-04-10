# SubscriptionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /Api/Subscription/Delete/{id} | |
|[**assign**](#assign) | **POST** /Api/Subscription/Assign | |
|[**create**](#create) | **POST** /Api/Subscription/Create | |
|[**edit**](#edit) | **PUT** /Api/Subscription/Edit/{id} | |
|[**find**](#find) | **GET** /Api/Subscription/Find/{id} | |
|[**list**](#list) | **GET** /Api/Subscription/List | |
|[**my**](#my) | **GET** /Api/Subscription/My | |
|[**subscribe**](#subscribe) | **POST** /Api/Subscription/My/Subscribe | |
|[**unsubscribe**](#unsubscribe) | **DELETE** /Api/Subscription/Unsubscribe/{id} | |
|[**unsubscribe_0**](#unsubscribe_0) | **DELETE** /Api/Subscription/My/Unsubscribe | |

# **_delete**
> BooleanResponseModel _delete()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance._delete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BooleanResponseModel**

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

# **assign**
> BooleanResponseModel assign(subscribeAsAdminRequestModel)


### Example

```typescript
import {
    SubscriptionApi,
    Configuration,
    SubscribeAsAdminRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let subscribeAsAdminRequestModel: SubscribeAsAdminRequestModel; //

const { status, data } = await apiInstance.assign(
    subscribeAsAdminRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subscribeAsAdminRequestModel** | **SubscribeAsAdminRequestModel**|  | |


### Return type

**BooleanResponseModel**

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

# **create**
> BooleanResponseModel create(subscriptionPostBodyRequestModel)


### Example

```typescript
import {
    SubscriptionApi,
    Configuration,
    SubscriptionPostBodyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let subscriptionPostBodyRequestModel: SubscriptionPostBodyRequestModel; //

const { status, data } = await apiInstance.create(
    subscriptionPostBodyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subscriptionPostBodyRequestModel** | **SubscriptionPostBodyRequestModel**|  | |


### Return type

**BooleanResponseModel**

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

# **edit**
> BooleanResponseModel edit(subscriptionPutBodyRequestModel)


### Example

```typescript
import {
    SubscriptionApi,
    Configuration,
    SubscriptionPutBodyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let id: string; // (default to undefined)
let subscriptionPutBodyRequestModel: SubscriptionPutBodyRequestModel; //

const { status, data } = await apiInstance.edit(
    id,
    subscriptionPutBodyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subscriptionPutBodyRequestModel** | **SubscriptionPutBodyRequestModel**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BooleanResponseModel**

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

# **find**
> SubscriptionFindResponseBaseModel find()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.find(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SubscriptionFindResponseBaseModel**

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

# **list**
> SubscriptionListResponseListBaseModel list()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

const { status, data } = await apiInstance.list();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SubscriptionListResponseListBaseModel**

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

# **my**
> my()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

const { status, data } = await apiInstance.my();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **subscribe**
> subscribe(subscribeRequestModel)


### Example

```typescript
import {
    SubscriptionApi,
    Configuration,
    SubscribeRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let subscribeRequestModel: SubscribeRequestModel; //

const { status, data } = await apiInstance.subscribe(
    subscribeRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subscribeRequestModel** | **SubscribeRequestModel**|  | |


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **unsubscribe**
> BooleanResponseModel unsubscribe()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.unsubscribe(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BooleanResponseModel**

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

# **unsubscribe_0**
> unsubscribe_0()


### Example

```typescript
import {
    SubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionApi(configuration);

const { status, data } = await apiInstance.unsubscribe_0();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

