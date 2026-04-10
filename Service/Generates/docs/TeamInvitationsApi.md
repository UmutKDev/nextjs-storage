# TeamInvitationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**accept**](#accept) | **POST** /Api/Team/Invitations/Accept | Accept team invitation|
|[**cancel**](#cancel) | **DELETE** /Api/Team/Invitations/{Id} | Cancel invitation|
|[**create**](#create) | **POST** /Api/Team/Invitations | Create team invitation|
|[**decline**](#decline) | **POST** /Api/Team/Invitations/Decline | Decline team invitation|
|[**listForTeam**](#listforteam) | **GET** /Api/Team/Invitations | List team invitations|
|[**listPending**](#listpending) | **GET** /Api/Team/Invitations/Pending | List user\&#39;s pending invitations|

# **accept**
> TeamMemberResponseBaseModel accept(teamInvitationAcceptRequestModel)


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration,
    TeamInvitationAcceptRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

let teamInvitationAcceptRequestModel: TeamInvitationAcceptRequestModel; //

const { status, data } = await apiInstance.accept(
    teamInvitationAcceptRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamInvitationAcceptRequestModel** | **TeamInvitationAcceptRequestModel**|  | |


### Return type

**TeamMemberResponseBaseModel**

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

# **cancel**
> BooleanResponseModel cancel()


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

let id: string; // (default to undefined)
let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance.cancel(
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
> TeamInvitationResponseBaseModel create(teamInvitationCreateRequestModel)


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration,
    TeamInvitationCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)
let teamInvitationCreateRequestModel: TeamInvitationCreateRequestModel; //

const { status, data } = await apiInstance.create(
    xTeamId,
    teamInvitationCreateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamInvitationCreateRequestModel** | **TeamInvitationCreateRequestModel**|  | |
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


### Return type

**TeamInvitationResponseBaseModel**

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

# **decline**
> BooleanResponseModel decline(teamInvitationDeclineRequestModel)


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration,
    TeamInvitationDeclineRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

let teamInvitationDeclineRequestModel: TeamInvitationDeclineRequestModel; //

const { status, data } = await apiInstance.decline(
    teamInvitationDeclineRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamInvitationDeclineRequestModel** | **TeamInvitationDeclineRequestModel**|  | |


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

# **listForTeam**
> TeamInvitationResponseListBaseModel listForTeam()


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance.listForTeam(
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


### Return type

**TeamInvitationResponseListBaseModel**

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

# **listPending**
> TeamInvitationResponseListBaseModel listPending()


### Example

```typescript
import {
    TeamInvitationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamInvitationsApi(configuration);

const { status, data } = await apiInstance.listPending();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TeamInvitationResponseListBaseModel**

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

