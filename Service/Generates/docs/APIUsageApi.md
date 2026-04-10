# APIUsageApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**current**](#current) | **GET** /Api/v1/Usage/Current | |

# **current**
> current()


### Example

```typescript
import {
    APIUsageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIUsageApi(configuration);

let xApiSecret: string; // (default to undefined)
let xApiKey: string; // (default to undefined)

const { status, data } = await apiInstance.current(
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

