# TeamMembersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**leave**](#leave) | **POST** /Api/Team/Members/Leave | Leave the team|
|[**list**](#list) | **GET** /Api/Team/Members | List team members|
|[**remove**](#remove) | **DELETE** /Api/Team/Members/{MemberId} | Remove a member from team|
|[**transferOwnership**](#transferownership) | **POST** /Api/Team/Members/TransferOwnership | Transfer team ownership|
|[**updateRole**](#updaterole) | **PUT** /Api/Team/Members/{MemberId}/Role | Change member role|

# **leave**
> BooleanResponseModel leave()


### Example

```typescript
import {
    TeamMembersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamMembersApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance.leave(
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **list**
> TeamMemberResponseListBaseModel list()


### Example

```typescript
import {
    TeamMembersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamMembersApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)

const { status, data } = await apiInstance.list(
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


### Return type

**TeamMemberResponseListBaseModel**

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

# **remove**
> BooleanResponseModel remove()


### Example

```typescript
import {
    TeamMembersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamMembersApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)
let memberId: string; // (default to undefined)

const { status, data } = await apiInstance.remove(
    xTeamId,
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|
| **memberId** | [**string**] |  | defaults to undefined|


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

# **transferOwnership**
> BooleanResponseModel transferOwnership(teamTransferOwnershipRequestModel)


### Example

```typescript
import {
    TeamMembersApi,
    Configuration,
    TeamTransferOwnershipRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamMembersApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)
let teamTransferOwnershipRequestModel: TeamTransferOwnershipRequestModel; //

const { status, data } = await apiInstance.transferOwnership(
    xTeamId,
    teamTransferOwnershipRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamTransferOwnershipRequestModel** | **TeamTransferOwnershipRequestModel**|  | |
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|


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

# **updateRole**
> TeamMemberResponseBaseModel updateRole(teamMemberUpdateRoleRequestModel)


### Example

```typescript
import {
    TeamMembersApi,
    Configuration,
    TeamMemberUpdateRoleRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new TeamMembersApi(configuration);

let xTeamId: string; //Team ID to operate on (default to undefined)
let memberId: string; // (default to undefined)
let teamMemberUpdateRoleRequestModel: TeamMemberUpdateRoleRequestModel; //

const { status, data } = await apiInstance.updateRole(
    xTeamId,
    memberId,
    teamMemberUpdateRoleRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **teamMemberUpdateRoleRequestModel** | **TeamMemberUpdateRoleRequestModel**|  | |
| **xTeamId** | [**string**] | Team ID to operate on | defaults to undefined|
| **memberId** | [**string**] |  | defaults to undefined|


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

