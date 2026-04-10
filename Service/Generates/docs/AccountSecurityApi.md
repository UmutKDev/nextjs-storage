# AccountSecurityApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createApiKey**](#createapikey) | **POST** /Api/Account/Security/ApiKeys | Create new API key|
|[**deletePasskey**](#deletepasskey) | **DELETE** /Api/Account/Security/Passkey/{passkeyId} | Delete a passkey|
|[**getApiKeys**](#getapikeys) | **GET** /Api/Account/Security/ApiKeys | Get all API keys|
|[**getPasskeys**](#getpasskeys) | **GET** /Api/Account/Security/Passkey | Get registered passkeys|
|[**getSessions**](#getsessions) | **GET** /Api/Account/Security/Sessions | Get all active sessions|
|[**logoutAll**](#logoutall) | **POST** /Api/Account/Security/Sessions/LogoutAll | Logout all sessions|
|[**logoutOthers**](#logoutothers) | **POST** /Api/Account/Security/Sessions/LogoutOthers | Logout all other sessions except current|
|[**passkeyRegisterBegin**](#passkeyregisterbegin) | **POST** /Api/Account/Security/Passkey/Register/Begin | Begin passkey registration|
|[**passkeyRegisterFinish**](#passkeyregisterfinish) | **POST** /Api/Account/Security/Passkey/Register/Finish | Complete passkey registration|
|[**regenerateBackupCodes**](#regeneratebackupcodes) | **POST** /Api/Account/Security/TwoFactor/BackupCodes/Regenerate | Regenerate backup codes|
|[**revokeApiKey**](#revokeapikey) | **DELETE** /Api/Account/Security/ApiKeys/{apiKeyId} | Revoke API key|
|[**revokeSession**](#revokesession) | **DELETE** /Api/Account/Security/Sessions/{sessionId} | Revoke specific session|
|[**rotateApiKey**](#rotateapikey) | **POST** /Api/Account/Security/ApiKeys/{apiKeyId}/Rotate | Rotate API key secret|
|[**twoFactorDisable**](#twofactordisable) | **POST** /Api/Account/Security/TwoFactor/TOTP/Disable | Disable TOTP 2FA|
|[**twoFactorSetup**](#twofactorsetup) | **POST** /Api/Account/Security/TwoFactor/TOTP/Setup | Setup TOTP 2FA|
|[**twoFactorStatus**](#twofactorstatus) | **GET** /Api/Account/Security/TwoFactor/Status | Get 2FA status|
|[**twoFactorVerify**](#twofactorverify) | **POST** /Api/Account/Security/TwoFactor/TOTP/Verify | Verify and enable TOTP 2FA|
|[**updateApiKey**](#updateapikey) | **POST** /Api/Account/Security/ApiKeys/{apiKeyId} | Update API key|

# **createApiKey**
> ApiKeyCreatedResponseBaseModel createApiKey(apiKeyCreateRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    ApiKeyCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let apiKeyCreateRequestModel: ApiKeyCreateRequestModel; //

const { status, data } = await apiInstance.createApiKey(
    apiKeyCreateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiKeyCreateRequestModel** | **ApiKeyCreateRequestModel**|  | |


### Return type

**ApiKeyCreatedResponseBaseModel**

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

# **deletePasskey**
> BooleanResponseModel deletePasskey()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let passkeyId: string; // (default to undefined)

const { status, data } = await apiInstance.deletePasskey(
    passkeyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passkeyId** | [**string**] |  | defaults to undefined|


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

# **getApiKeys**
> ApiKeyViewBaseModel getApiKeys()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.getApiKeys();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiKeyViewBaseModel**

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

# **getPasskeys**
> PasskeyViewListBaseModel getPasskeys()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.getPasskeys();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PasskeyViewListBaseModel**

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

# **getSessions**
> SessionViewBaseModel getSessions()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.getSessions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SessionViewBaseModel**

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

# **logoutAll**
> BooleanResponseModel logoutAll()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.logoutAll();
```

### Parameters
This endpoint does not have any parameters.


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

# **logoutOthers**
> BooleanResponseModel logoutOthers()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.logoutOthers();
```

### Parameters
This endpoint does not have any parameters.


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

# **passkeyRegisterBegin**
> PasskeyRegistrationBeginResponseBaseModel passkeyRegisterBegin(passkeyRegistrationBeginRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    PasskeyRegistrationBeginRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let passkeyRegistrationBeginRequestModel: PasskeyRegistrationBeginRequestModel; //

const { status, data } = await apiInstance.passkeyRegisterBegin(
    passkeyRegistrationBeginRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passkeyRegistrationBeginRequestModel** | **PasskeyRegistrationBeginRequestModel**|  | |


### Return type

**PasskeyRegistrationBeginResponseBaseModel**

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

# **passkeyRegisterFinish**
> PasskeyViewBaseModel passkeyRegisterFinish(passkeyRegistrationFinishRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    PasskeyRegistrationFinishRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let passkeyRegistrationFinishRequestModel: PasskeyRegistrationFinishRequestModel; //

const { status, data } = await apiInstance.passkeyRegisterFinish(
    passkeyRegistrationFinishRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passkeyRegistrationFinishRequestModel** | **PasskeyRegistrationFinishRequestModel**|  | |


### Return type

**PasskeyViewBaseModel**

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

# **regenerateBackupCodes**
> TwoFactorBackupCodesResponseBaseModel regenerateBackupCodes(twoFactorVerifyRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    TwoFactorVerifyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let twoFactorVerifyRequestModel: TwoFactorVerifyRequestModel; //

const { status, data } = await apiInstance.regenerateBackupCodes(
    twoFactorVerifyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **twoFactorVerifyRequestModel** | **TwoFactorVerifyRequestModel**|  | |


### Return type

**TwoFactorBackupCodesResponseBaseModel**

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

# **revokeApiKey**
> BooleanResponseModel revokeApiKey()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let apiKeyId: string; // (default to undefined)

const { status, data } = await apiInstance.revokeApiKey(
    apiKeyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiKeyId** | [**string**] |  | defaults to undefined|


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

# **revokeSession**
> BooleanResponseModel revokeSession()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let sessionId: string; // (default to undefined)

const { status, data } = await apiInstance.revokeSession(
    sessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sessionId** | [**string**] |  | defaults to undefined|


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

# **rotateApiKey**
> ApiKeyRotateResponseBaseModel rotateApiKey()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let apiKeyId: string; // (default to undefined)

const { status, data } = await apiInstance.rotateApiKey(
    apiKeyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiKeyId** | [**string**] |  | defaults to undefined|


### Return type

**ApiKeyRotateResponseBaseModel**

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

# **twoFactorDisable**
> BooleanResponseModel twoFactorDisable(twoFactorVerifyRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    TwoFactorVerifyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let twoFactorVerifyRequestModel: TwoFactorVerifyRequestModel; //

const { status, data } = await apiInstance.twoFactorDisable(
    twoFactorVerifyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **twoFactorVerifyRequestModel** | **TwoFactorVerifyRequestModel**|  | |


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

# **twoFactorSetup**
> TwoFactorSetupResponseBaseModel twoFactorSetup()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.twoFactorSetup();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TwoFactorSetupResponseBaseModel**

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

# **twoFactorStatus**
> TwoFactorStatusResponseBaseModel twoFactorStatus()


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

const { status, data } = await apiInstance.twoFactorStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TwoFactorStatusResponseBaseModel**

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

# **twoFactorVerify**
> TwoFactorBackupCodesResponseBaseModel twoFactorVerify(twoFactorVerifyRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    TwoFactorVerifyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let twoFactorVerifyRequestModel: TwoFactorVerifyRequestModel; //

const { status, data } = await apiInstance.twoFactorVerify(
    twoFactorVerifyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **twoFactorVerifyRequestModel** | **TwoFactorVerifyRequestModel**|  | |


### Return type

**TwoFactorBackupCodesResponseBaseModel**

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

# **updateApiKey**
> ApiKeyViewBaseModel updateApiKey(apiKeyUpdateRequestModel)


### Example

```typescript
import {
    AccountSecurityApi,
    Configuration,
    ApiKeyUpdateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AccountSecurityApi(configuration);

let apiKeyId: string; // (default to undefined)
let apiKeyUpdateRequestModel: ApiKeyUpdateRequestModel; //

const { status, data } = await apiInstance.updateApiKey(
    apiKeyId,
    apiKeyUpdateRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiKeyUpdateRequestModel** | **ApiKeyUpdateRequestModel**|  | |
| **apiKeyId** | [**string**] |  | defaults to undefined|


### Return type

**ApiKeyViewBaseModel**

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

