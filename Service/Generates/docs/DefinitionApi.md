# DefinitionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**findDefinition**](#finddefinition) | **GET** /Api/Definition/Find/{groupCode}/{code} | |
|[**findGroup**](#findgroup) | **GET** /Api/Definition/Group/Find/{groupCode} | |
|[**listDefinition**](#listdefinition) | **GET** /Api/Definition/List/{groupCode} | |
|[**listGroup**](#listgroup) | **GET** /Api/Definition/Group/List | |

# **findDefinition**
> findDefinition()


### Example

```typescript
import {
    DefinitionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefinitionApi(configuration);

const { status, data } = await apiInstance.findDefinition();
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

# **findGroup**
> findGroup()


### Example

```typescript
import {
    DefinitionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefinitionApi(configuration);

const { status, data } = await apiInstance.findGroup();
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

# **listDefinition**
> listDefinition()


### Example

```typescript
import {
    DefinitionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefinitionApi(configuration);

let groupCode: string; // (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listDefinition(
    groupCode,
    search,
    skip,
    take
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupCode** | [**string**] |  | defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|


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

# **listGroup**
> DefinitionGroupResponseListBaseModel listGroup()


### Example

```typescript
import {
    DefinitionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefinitionApi(configuration);

let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listGroup(
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

**DefinitionGroupResponseListBaseModel**

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

