# HomeApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**home**](#home) | **GET** / | |

# **home**
> StringResponseModel home()


### Example

```typescript
import {
    HomeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HomeApi(configuration);

const { status, data } = await apiInstance.home();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**StringResponseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

