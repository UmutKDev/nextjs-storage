# AccountApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**changePassword**](#changepassword) | **PUT** /Api/Account/ChangePassword | |
|[**edit**](#edit) | **PUT** /Api/Account/Edit | |
|[**profile**](#profile) | **GET** /Api/Account/Profile | |

# **changePassword**
> BooleanResponseModel changePassword(accountChangePasswordRequestModel)


### Example

```typescript
import {
    AccountApi,
    Configuration,
    AccountChangePasswordRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountApi(configuration);

let accountChangePasswordRequestModel: AccountChangePasswordRequestModel; //

const { status, data } = await apiInstance.changePassword(
    accountChangePasswordRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accountChangePasswordRequestModel** | **AccountChangePasswordRequestModel**|  | |


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
> BooleanResponseModel edit(accountPutBodyRequestModel)


### Example

```typescript
import {
    AccountApi,
    Configuration,
    AccountPutBodyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountApi(configuration);

let accountPutBodyRequestModel: AccountPutBodyRequestModel; //

const { status, data } = await apiInstance.edit(
    accountPutBodyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accountPutBodyRequestModel** | **AccountPutBodyRequestModel**|  | |


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

# **profile**
> AccountProfileResponseBaseModel profile()


### Example

```typescript
import {
    AccountApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountApi(configuration);

const { status, data } = await apiInstance.profile();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AccountProfileResponseBaseModel**

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

