# UserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /Api/User/Delete/{id} | |
|[**create**](#create) | **POST** /Api/User/Create | |
|[**edit**](#edit) | **PUT** /Api/User/Edit/{id} | |
|[**find**](#find) | **GET** /Api/User/Find/{id} | |
|[**list**](#list) | **GET** /Api/User/List | |

# **_delete**
> BooleanResponseModel _delete()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

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

# **create**
> BooleanResponseModel create(userPostBodyRequestModel)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserPostBodyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userPostBodyRequestModel: UserPostBodyRequestModel; //

const { status, data } = await apiInstance.create(
    userPostBodyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userPostBodyRequestModel** | **UserPostBodyRequestModel**|  | |


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
> BooleanResponseModel edit(userPutBodyRequestModel)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserPutBodyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let userPutBodyRequestModel: UserPutBodyRequestModel; //

const { status, data } = await apiInstance.edit(
    id,
    userPutBodyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userPutBodyRequestModel** | **UserPutBodyRequestModel**|  | |
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
> UserFindResponseBaseModel find()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

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

**UserFindResponseBaseModel**

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
> UserListResponseListBaseModel list()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.list(
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

**UserListResponseListBaseModel**

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

