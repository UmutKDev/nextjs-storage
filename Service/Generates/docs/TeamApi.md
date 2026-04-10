# TeamApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /Api/Team/{Id} | Delete team (owner only)|
|[**create**](#create) | **POST** /Api/Team | Create a new team|
|[**find**](#find) | **GET** /Api/Team/{Id} | Get team details|
|[**list**](#list) | **GET** /Api/Team | List user\&#39;s teams|
|[**update**](#update) | **PUT** /Api/Team/{Id} | Update team settings|

# **_delete**
> BooleanResponseModel _delete()


### Example

```typescript
import {
    TeamApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamApi(configuration);

let id: string; // (default to undefined)
let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance._delete(
    id,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


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
> TeamResponseBaseModel create(teamCreateRequestModel)


### Example

```typescript
import {
    TeamApi,
    Configuration,
    TeamCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamApi(configuration);

let teamCreateRequestModel: TeamCreateRequestModel; //

const { status, data } = await apiInstance.create(
    teamCreateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamCreateRequestModel** | **TeamCreateRequestModel**|  | |


### Return type

**TeamResponseBaseModel**

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
> TeamDetailResponseBaseModel find()


### Example

```typescript
import {
    TeamApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamApi(configuration);

let id: string; // (default to undefined)
let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance.find(
    id,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


### Return type

**TeamDetailResponseBaseModel**

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
> TeamResponseListBaseModel list()


### Example

```typescript
import {
    TeamApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamApi(configuration);

const { status, data } = await apiInstance.list();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TeamResponseListBaseModel**

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

# **update**
> TeamResponseBaseModel update(teamUpdateRequestModel)


### Example

```typescript
import {
    TeamApi,
    Configuration,
    TeamUpdateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamApi(configuration);

let id: string; // (default to undefined)
let xTeamId: string; //Team ID to operate on (default to undefined)
let teamUpdateRequestModel: TeamUpdateRequestModel; //

const { status, data } = await apiInstance.update(
    id,
    xTeamId,
    teamUpdateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamUpdateRequestModel** | **TeamUpdateRequestModel**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


### Return type

**TeamResponseBaseModel**

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

