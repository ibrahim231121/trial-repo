import { MaxRetentionPolicyDetail } from './../../Application/Assets/AssetLister/Category/Model/MaxRetentionPolicyDetail';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Category, CategoryModel } from './models/CategoryModels';
import { Policy } from './models/PolicyModels';
import { Cases } from './models/CasesModels';
import { TrackingAndSharing } from './models/TrackingAndSharingModels';
import { CRXLoader } from "@cb/shared"
import { CaseSharing } from './models/CaseSharingModels'
import jwt_decode from 'jwt-decode';
import { LicensePlate } from './models/NumberPlateModel';

import {
    AddOwner,
    Asset,
    AssetSharingModel,
    AssetViewReason,
    Bookmark,
    Evidence,
    File,
    Note,
    TimelinesSync,
    EvdenceCategoryAssignment,
    MetadataFileType,
    AssetsLinking,
    EvidenceCategory
} from './models/EvidenceModels';
import { File as FileF } from './models/FileModels';
import {
    AI_COORDINATOR_SERVICE_URL,
    EVIDENCE_SERVICE_URL,
    BASE_URL_USER_SERVICE,
    SETUP_CONFIGURATION_SERVICE_URL,
    USER_INFO_GET_URL,
    USER, GROUP_GET_URL,
    ADGROUP_GET_URL,
    GROUP_GET_BY_ID_URL,
    GROUP_USER_COUNT_GET_URL,
    BASE_URL_UNIT_SERVICES,
    FILE_SERVICE_URL,
    AUDITLOG_SERVICE_URL,
    CountryStateApiUrl,
    EVIDENCE_GET_URL,
    BASE_URL_AUTHENTICATION_SERVICE,
    EVIDENCE_GET_BY_ID_URL,
    BASE_URL_CASES_SERVICE,
    BASE_URL_Configuration_SERVICE,
    BASE_URL_DeviceHeartBeat_SERVICE,
    BASE_URL_COMMAND_SERVICE,
    FILE_SERVICE_URL_V2,
    USERGROUP_GET_URL,
	BASE_URL_ALPR_Service,
} from './url';
import { getVerificationURL } from "../../utils/settings";
import { Token } from './models/AuthenticationModels';
import Cookies from 'universal-cookie';
import { UserGroups, GroupUserCount, UserList, User, Module, UserStatus, ADGroups, AddGroup } from './models/UsersAndIdentitiesModel'
import {
    ConfigurationTemplate,
    ConfigurationTemplateLogs,
    DefaultUnitTemplate,
    DeviceConfigurationTemplate,
    DeviceType,
    GetPrimaryDeviceInfo,
    QueuedAssets,
    UnitAndDevice,
    Unit,
    UnitInfo,
    UnitTemp,
    UnitTemplateConfigurationInfo,
    SoftwareVersion,
    UpdateVersion,
    FilterUpdateVersion,
    AssignUsersToUnit,
    DeviceConfigurations
} from './models/UnitModels';
import { CaptureDevice, Station, StationPolicy } from './models/StationModels';
import { Paginated, Headers, CMTEntityRecord } from './models/CommonModels';
import { useState, useEffect } from 'react';
import { setLoaderValue } from './../../Redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { SetupConfigurationsModel } from './models/SetupConfigurations';
import { SensorsAndTriggers } from './models/SensorsAndTriggers';
import { RetentionPolicies } from './models/RetentionPolicies';
import { UploadPolicies } from './models/UploadPolicies';
import { Case, TCaseHighlight, TCaseTimeline, TCaseClosedReason, TCaseClose, TCaseAsset } from '../../Application/Cases/CaseTypes';
import { StationPolicyConfigurationTemplate } from '../../Application/Admin/Station/DefaultUnitTemplate/DefaultUnitTemplateModel';
import { Job, Project } from './models/AICoordinatorModels';
import { TCaseAudit } from './models/CaseAuditModels';
import { CaseStatus } from './models/CaseStatusModels';
import { KeyValueMatch } from '../../Application/TrackingAndSharing/TrackingAndSharingTypes';
import { NameAndValue } from '../../Application/Admin/User/UserTypes';
import { HotListTemplate } from './models/HotListModels';
import { HotListDataSourceTemplate } from './models/HotListDataSourceModels';
import { AlprCapturePlateInfo } from './models/AlprCapturePlateInfo';

const cookies = new Cookies();
let config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cookies.get("access_token"),
        'UserId': getUserId(),
        'TenantId': getTenantId()
    }
}

export const setAPIAgentConfig = () => {
    config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cookies.get("access_token"),
            'UserId': getUserId(),
            'TenantId': getTenantId()
        }
    }
}
axios.interceptors.response.use(async (response: any) => {
    try {
        return response;
    } catch (ex) {
        return await Promise.reject(ex);
    }
}, async (error: AxiosError) => {
    // console.log(error.request.responseURL + ", error code: " + error.response?.status);
    // if (error.code === "ERR_NETWORK") { // Handles preflight OPTIONS request rejection by Ocelot
    //     Logout()
    // }
    const status: number | undefined = error.response?.status;
    // if (status === 401) { // Unauthorized request redirection - need to add routine to retreive new token and re-attempt request
    //     Logout()
    // }
    return Promise.reject(error);
})

const responseBody = <T>(response: AxiosResponse<T>) => {
    return response.data;
};


const responseBodyPaginated = <T>(response: AxiosResponse<T>) => {
    let totalCount = response.headers["x-total-count"];
    if (totalCount !== undefined) {
        let paginatedResponse = {
            data: response.data,
            totalCount: parseInt(totalCount)
        }
        return paginatedResponse;
    }
};

const setBaseUrl = (baseUrl: string) => axios.defaults.baseURL = baseUrl;
const addHeaders = (headers?: Headers[]) => {

    if (config && headers) {
        let config2: any = config;
        if (config2["headers"]) {
            let ConfigHeader: any[] = Object.entries(config2["headers"]);
            headers.forEach((x: Headers) => {
                let a = [x.key, x.value];
                ConfigHeader.push(a)
            })
            var obj = ConfigHeader.reduce((obj, cur) => ({ ...obj, [cur[0]]: cur[1] }), {})
            return { headers: obj }
        }
        else {
            return config;
        }
    }
    else {
        return config;
    }
};

export function getUserId() {
    let accessToken = cookies.get('access_token');
    if (accessToken) {
        let decodedAccessToken: any = jwt_decode(accessToken);
        return decodedAccessToken.UserId;
    }
    else {
        return "0";
    }
};

function getTenantId() {
    let accessToken = cookies.get('access_token');
    if (accessToken) {
        let decodedAccessToken: any = jwt_decode(accessToken);
        return decodedAccessToken.TenantId;
    }
    else {
        return "1";
    }
};

const requests = {
    get: <T>(baseUrl: string, url: string, config?: {}) => { setBaseUrl(baseUrl); return axios.get<T>(url, config).then(responseBody) },
    getAll: <T>(baseUrl: string, url: string, config?: {}) => { setBaseUrl(baseUrl); return axios.get<T>(url, config).then(responseBodyPaginated) },
    post: <T>(baseUrl: string, url: string, body: {}, config?: {}) => { setBaseUrl(baseUrl); return axios.post<T>(url, body, config).then(responseBody) },
    postPaginated: <T>(baseUrl: string, url: string, body: {}, config?: {}) => { setBaseUrl(baseUrl); return axios.post<T>(url, body, config).then(responseBodyPaginated) },
    put: <T>(baseUrl: string, url: string, body: {}, config?: {}) => { setBaseUrl(baseUrl); return axios.put<T>(url, body, config).then(responseBody) },
    patch: <T>(baseUrl: string, url: string, body: {}, config?: {}) => { setBaseUrl(baseUrl); return axios.patch<T>(url, body, config).then(responseBody) },
    delete: <T>(baseUrl: string, url: string, config?: {}) => { setBaseUrl(baseUrl); return axios.delete<T>(url, config).then(responseBody) },
}
export const SetupConfigurationAgent = {
    getAllControlTypes: () => requests.get<UnitTemplateConfigurationInfo[]>(SETUP_CONFIGURATION_SERVICE_URL, "/Fields/GetAllControlTypesKeyValues", config),
    getAllCategories: (url: string) => requests.get<Category[]>(SETUP_CONFIGURATION_SERVICE_URL, url, config),
    postCategories: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    deleteCategoryForms: (extraHeader?: Headers[]) => requests.delete<void>(SETUP_CONFIGURATION_SERVICE_URL, `/Forms`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    postFormFields: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    putCategories: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    putFormField: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    deleteFormFields: (extraHeader?: Headers[]) => requests.delete<void>(SETUP_CONFIGURATION_SERVICE_URL, `/Fields`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getSingleCategory: (id: number) => requests.get<CategoryModel>(SETUP_CONFIGURATION_SERVICE_URL, `/Categories/${id}`, config),
    getSingleFormField: (id: number) => requests.get<any>(SETUP_CONFIGURATION_SERVICE_URL, `/Fields/${id}`, config),
    getSingleCategoryForm: (id: number) => requests.get<any>(SETUP_CONFIGURATION_SERVICE_URL, `/Forms/${id}`, config),
    postCategoryForms: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    putCategoryForms: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    getPoliciesAccordingToType: (url: string) => requests.get<Policy[]>(SETUP_CONFIGURATION_SERVICE_URL, url, config),
    getGetMaxRetentionDetail: (url: string, body: number[]) => requests.post<MaxRetentionPolicyDetail>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    getGlobalAssetViewReason: (url: string) => requests.get<SetupConfigurationsModel.GlobalAssetViewReason[]>(SETUP_CONFIGURATION_SERVICE_URL, url, config),

    putSensorsAndTriggersTemplate: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    postSensorsAndTriggersTemplate: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),

    getSensorsAndTriggersEvents: (url: string) => requests.get<SensorsAndTriggers[]>(SETUP_CONFIGURATION_SERVICE_URL, "/SensorEvents/GetEvent/" + url, config),
    deleteAllSensorsAndTriggersTemplate: (body: number[]) => requests.post<void>(SETUP_CONFIGURATION_SERVICE_URL, "/SensorEvents/DeleteAllEvents", body, config),
    deleteSensorsAndTriggersTemplate: (id: number) => requests.delete<void>(SETUP_CONFIGURATION_SERVICE_URL, "/SensorEvents/DeleteEvent/" + id, config),
    getAllFiltersSensorsAndTriggersEvents: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/SensorEvents/GetAllEvents${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getAllSensorsAndTriggersEvents: (url: any) => requests.get<SensorsAndTriggers[]>(SETUP_CONFIGURATION_SERVICE_URL, url, config),
    getAll: (url: any) => requests.get<any[]>(SETUP_CONFIGURATION_SERVICE_URL, url, config),
    getTenantSetting: (url?: any) => requests.get<any>(SETUP_CONFIGURATION_SERVICE_URL, url ?? "/TenantSettings", config),
    getTenantSettingCertificate: (url?: any) =>
    {
        return axios.get(SETUP_CONFIGURATION_SERVICE_URL + url ?? "/TenantSettings", {
            headers: config.headers,
            responseType: "blob",
        });
    },
    getTenantSettingTimezone: () => requests.get<any>(SETUP_CONFIGURATION_SERVICE_URL, "/TenantSettings/gettimezone", config),
    postTenantSetting: (body: any, url?: any) => requests.post<any>(SETUP_CONFIGURATION_SERVICE_URL, url ?? "/TenantSettings", body, config),
    putTenantSetting: (body: any, url?: any) => requests.put<any>(SETUP_CONFIGURATION_SERVICE_URL, url ?? "/TenantSettings", body, config),
    getMailServerSettings: (url: string) => requests.get<SetupConfigurationsModel.MailServer>(SETUP_CONFIGURATION_SERVICE_URL, url, config),


    deleteAllRetentionPoliciesTemplate: (body: number[]) => requests.post<void>(SETUP_CONFIGURATION_SERVICE_URL, "/Policies/DataRetention/", body, config),
    getRetentionPolicies: (id: number) => requests.get<RetentionPolicies[]>(SETUP_CONFIGURATION_SERVICE_URL, "/Policies/DataRetention/" + id, config),
    getAllFiltersRetentionPolicies: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Policies/GetPoliciesByType/DataRetention/${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getAllPoliciesByType: (type: string) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Policies/${type}`, config);
    },
    putRetentionPoliciesTemplate: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    postRetentionPoliciesTemplate: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    deleteAllUploadPoliciesTemplate: (body: number[]) => requests.post<void>(SETUP_CONFIGURATION_SERVICE_URL, "/Policies/DataUpload/", body, config),
    getUploadPolicies: (id: number) => requests.get<UploadPolicies[]>(SETUP_CONFIGURATION_SERVICE_URL, "/Policies/DataUpload/" + id, config),
    GetUploadPolicyValues: () => requests.get<any[]>(SETUP_CONFIGURATION_SERVICE_URL, "/Policies/GetUploadPolicyValues", config),
    getAllFiltersUploadPolicies: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Policies/GetPoliciesByType/DataUpload/${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    putUploadPoliciesTemplate: (url: string, body: any) => requests.put<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    postUploadPoliciesTemplate: (url: string, body: any) => requests.post<number>(SETUP_CONFIGURATION_SERVICE_URL, url, body, config),
    getAllFiltersCategories: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Categories${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getAllFiltersCategoryFroms: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Forms${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getAllCategoryFroms: (url: string) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Forms${url}`, config);
    },
    getSetupConfigurationBuildVersion: () => requests.get<any>(SETUP_CONFIGURATION_SERVICE_URL, "/SetupConfigurations/Health/BuildVersion"),
    getAllFormFields: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(SETUP_CONFIGURATION_SERVICE_URL, `/Fields${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getRetentionPolicyObjectFromRetentionIds: (url: string) => requests.get<any[]>(SETUP_CONFIGURATION_SERVICE_URL, `/Policies/RetentionIds/DataRetention?${url}`, config),
}
export const EvidenceAgent = {
    getEvidences: (extraHeader?: Headers[]) => requests.get<Evidence[]>(EVIDENCE_SERVICE_URL, '/Evidences', (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getAssetTrail: (url: string) => requests.get<Evidence[]>(EVIDENCE_SERVICE_URL, url, config),
    getEvidence: (evidenceId: number) => requests.get<Evidence>(EVIDENCE_SERVICE_URL, '/Evidences/' + evidenceId, config),
    getAsset: (url: string) => requests.get<Asset>(EVIDENCE_SERVICE_URL, url, config),
    getAssetFile: (url: string) => requests.get<File[]>(EVIDENCE_SERVICE_URL, url, config),
    getQueuedAssets: (unitId: number) => requests.get<QueuedAssets[]>(EVIDENCE_SERVICE_URL, '/Evidences/QueuedAssets/' + unitId, config),
    isStationExistsinEvidence: (url: string) => requests.get<number>(EVIDENCE_SERVICE_URL, url, config),
    addEvidence: (body: any) => requests.post<Evidence>(EVIDENCE_SERVICE_URL, '/Evidences', body, config),
    addAsset: (url: string, body: Asset) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body, config),
    updateAsset: (url: string, body: Asset) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body, config),
    getEvidenceCategories: (evidenceId: number) => requests.get<Evidence>(EVIDENCE_SERVICE_URL, '/Evidences/' + evidenceId, config),
    addBookmark: (url: string, body: Bookmark) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body, config),
    updateBookmark: (url: string, body: Bookmark) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body, config),
    deleteBookmark: (url: string) => requests.delete<void>(EVIDENCE_SERVICE_URL, url, config),
    addNote: (url: string, body: Note) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body, config),
    updateNote: (url: string, body: Note) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body, config),
    deleteNote: (url: string) => requests.delete<void>(EVIDENCE_SERVICE_URL, url, config),
    timelineSync: (url: string, body: TimelinesSync[]) => requests.patch<void>(EVIDENCE_SERVICE_URL, url, body, config),
    addAssetViewReason: (url: string, body: AssetViewReason) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body, config),
    addUsersToMultipleAsset: (url: string, body: AddOwner[]) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body, config),
    addUsersToAsset: (url: string, body: number[]) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body, config),
    setPrimaryAsset: (url: string) => requests.get<void>(EVIDENCE_SERVICE_URL, url, config),
    updateRetentionPolicy: (url: string, body: any) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body, config),
    shareAsset: (url: string, body?: AssetSharingModel[]) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body ?? {}, config),
    linkAsset: (url: string, body?: AssetsLinking[]) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body ?? {}, config),

    //openSharedMedia: (url: string) => requests.get<AssetSharingModel>(EVIDENCE_SERVICE_URL+'/OpenSharedMedia?E='+url),

    LockOrUnLockAsset: (body: any) => requests.patch<void>(EVIDENCE_SERVICE_URL, '/Evidences/LockUnlock', body, config),
    ExportEvidence: (evidenceId: number, assetId: number, fileType: MetadataFileType) => {
        return axios.get(`${EVIDENCE_SERVICE_URL}/Evidences/ExportAsset/${evidenceId}/${assetId}/${fileType}`, {
            headers: config.headers,
            responseType: "blob",
        });
    },
    getUploadedEvidence: (evidenceId: string) => requests.get<any>(EVIDENCE_GET_BY_ID_URL, '/' + evidenceId, config),
    getEvidenceBuildVersion: () => requests.get<any>(EVIDENCE_SERVICE_URL, "/Evidence/Health/BuildVersion"),
    addAssetLog: (url: string, body: any) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body, config),
    masterAssetRequestUpload: (url: string) => requests.post<any>(EVIDENCE_SERVICE_URL, url, {}, config),
    GetAssetsForUnit: (unitId: number) => requests.get<number>(EVIDENCE_SERVICE_URL, '/Evidences/GetAssetsForUnit/' + unitId, config),
    childAssetRequestUpload: (url: string) => requests.post<any>(EVIDENCE_GET_URL, url, {}, config),
    getRelatedAssets: (evidenceId: number) => requests.get<any>(EVIDENCE_SERVICE_URL, '/Evidences/RelatedAssets/' + evidenceId, config),
    getMultipleAssetsTrail: (url:string, extraHeader?: Headers[]) => requests.get<number>(EVIDENCE_SERVICE_URL, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    assignCategoriesToEvidence: (body: Array<EvidenceCategory>) => requests.post<void>(EVIDENCE_SERVICE_URL, '/Evidences/AssignCategories', body, config),
    unAssignCategoryFromEvidence: (body: Array<EvidenceCategory>, message : string) => requests.post<void>(EVIDENCE_SERVICE_URL, `/Evidences/UnAssignCategories?removalReason=${message}`, body, config),
    changeCategories: (body: Array<EvdenceCategoryAssignment>, extraHeader: Headers[], editReason: string = "") => requests.patch<void>(EVIDENCE_SERVICE_URL, `/Evidences/ChangeCategories?editReason=${editReason}`, body, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
}

export const AuthenticationAgent = {
    getAccessToken: (url: string) => requests.get<Token>(getVerificationURL(url), '', config),
    getAzureADUserTokens: (url: string) => requests.get<Token>(BASE_URL_AUTHENTICATION_SERVICE, url, config),
    getAccessAndRefreshToken: (url: string) => requests.get<any>(BASE_URL_AUTHENTICATION_SERVICE, url, config),
    getAuthenticationBuildVersion: () => requests.get<any>(BASE_URL_AUTHENTICATION_SERVICE, "/Authentication/Health/BuildVersion"),
    getAzureCred: () => requests.get<any>(BASE_URL_AUTHENTICATION_SERVICE, '/Authentication/AzureCred'),
   
    sendEmail: (url: string, email: string, clientId: string, applicationName: string, isResendActivation: boolean) => requests.post<any>(BASE_URL_AUTHENTICATION_SERVICE, `${url}?email=${email}&client_id=${clientId}&applicationName=${applicationName}&resendActivation=${isResendActivation}`, {}, config)
}

export const AuditLogAgent = {
    getUnitAuditLogs: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(AUDITLOG_SERVICE_URL, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    exportAuditLogs: (url: string, extraHeader?: Headers[]) => {
        return requests.get<any>(AUDITLOG_SERVICE_URL, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getAuditLogBuildVersion: () => requests.get<any>(AUDITLOG_SERVICE_URL, "/AuditLogs/Health/BuildVersion"),
}

export const FileAgent = {
    getDownloadFileUrl: (url: string) => requests.get<string>(FILE_SERVICE_URL_V2, url, config),
    getDownloadUrl: (url: string) => requests.get<string>(FILE_SERVICE_URL + "/Files", url, config),
    getFile: (url: string) => requests.get<FileF>(FILE_SERVICE_URL_V2, url, config),
    getHealthCheck: () => requests.get<string>(FILE_SERVICE_URL, '/Files/HealthCheck', config),
    getFileBuildVersion: () => requests.get<any>(FILE_SERVICE_URL, "/Files/Health/BuildVersion"),
    changeFileUploadStatus: (url: any, body: any) => requests.patch<any>(FILE_SERVICE_URL_V2, url, body, config),
    uploadAssetChecksum: (fileId: string,) => requests.get<void>(FILE_SERVICE_URL_V2, '/Files/UploadAssetChecksum?fileId=' + fileId, config),
    getMultiDownloadFileUrl: (body: any) => {
        return axios.post(`${FILE_SERVICE_URL_V2}/Files/multifiledownload`, body, {
            headers: config.headers,
            responseType: "blob",
        });
    },
    //getThumbnail: (name: string, accessCode: string, tenantId : number, isVideoFile: boolean) => requests.get<any>(FILE_SERVICE_URL_V2, `/Files/FetchThumbnail/${name}/${accessCode}/${tenantId}/${isVideoFile}`, config),
}

export const UsersAndIdentitiesServiceAgent = {
    getAllUsers: (url: string) => requests.get<UserList[]>(USER_INFO_GET_URL, url, config),

    //getUsersInfo: (url: string, body: any) => requests.postPaginated<Paginated<UsersInfo[]>>(USER_INFO_GET_URL, url, body, config),
    getUsersInfo: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(USER_INFO_GET_URL, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },

    getUsersGroups: () => requests.get<UserGroups[]>(GROUP_GET_URL, '', config),
    getAllUsersGroups: () => requests.get<any[]>(USERGROUP_GET_URL, '', config),
    getADGroups: (authServer: any) => requests.get<ADGroups[]>(BASE_URL_USER_SERVICE, authServer, config),
    getADGroupsMapping: (authServer: any) => requests.get<AddGroup[]>(BASE_URL_USER_SERVICE, authServer, config),
    deleteADGroupsMapping: (url: string) => requests.delete<void>(BASE_URL_USER_SERVICE, url, config),
    upsertADRecords: (url: string, body: AddGroup[]) => requests.post<number>(BASE_URL_USER_SERVICE, url, body, config),
    getGroups: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<any>>(GROUP_GET_BY_ID_URL, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getUserStatusKeyValues: (url: string) => requests.get<UserStatus[]>('', url, config),
    getAllUserGroupKeyValues: (url: string) => requests.get<UserGroups[]>('', url, config),

    getUserGroupCount: () => requests.get<GroupUserCount[]>(GROUP_USER_COUNT_GET_URL, '', config),
    getUser: (userId: string) => requests.get<UserList>(USER, `/${userId}`, config),
    addUser: (url: string, body: User) => requests.post<number>(BASE_URL_USER_SERVICE, url, body, config),
    editUser: (url: string, body: User) => requests.put<number>(BASE_URL_USER_SERVICE, url, body, config),
    getResponseAppPermission: (url: string) => requests.get<Module>(BASE_URL_USER_SERVICE, url, config),
    updateUserInfoURL: (url: string, body: any) => requests.patch<void>(BASE_URL_USER_SERVICE, url, body, config),
    getUserGroupsById: (id: string) => requests.get<UserGroups>(GROUP_GET_BY_ID_URL, `/${id}`, config),
    getSelectedUserGroups: (id: string) => requests.get<UserGroups>(GROUP_GET_BY_ID_URL, `/${id}`, config),
    addUserGroup: (url: string, body: UserGroups) => requests.post<number>(GROUP_GET_BY_ID_URL, url, body, config),
    editUserGroup: (url: string, body: UserGroups) => requests.put<void>(GROUP_GET_BY_ID_URL, url, body, config),
    getUserBuildVersion: () => requests.get<any>(BASE_URL_USER_SERVICE, "/UsersIdentities/Health/BuildVersion"),
    getPredictiveUsers: (predictiveText: string) => requests.get<any>(BASE_URL_USER_SERVICE, `/Users/UserPredictiveSearch?predictiveText=${predictiveText}`, config),
}
export const UnitsAndDevicesAgent = {
    getAllUnits: (url: string, extraHeader?: Headers[]) => {
        return requests.get<Unit[]>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config)
    },
    getUnit: (url: string) => requests.get<UnitAndDevice[]>(BASE_URL_UNIT_SERVICES, url, config),
    getAssignedUsers: (url: string) => requests.get<CMTEntityRecord[]>(BASE_URL_UNIT_SERVICES, url, config),
    getAssignedGroups: (url: string) => requests.get<CMTEntityRecord[]>(BASE_URL_UNIT_SERVICES, url, config),

    getConfigurationTemplateList: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url, config),
    getPrimaryDeviceInfo: (url: string) => requests.get<GetPrimaryDeviceInfo>(BASE_URL_UNIT_SERVICES, url, config),
    changeUnitInfo: (url: string, body: UnitTemp) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body, config),
    deleteUnit: (url: string) => requests.delete<void>(BASE_URL_UNIT_SERVICES, url, config),
    deleteStation: (url: string) => requests.delete<void>(BASE_URL_UNIT_SERVICES, url, config),
    getUnitInfo: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<UnitInfo[]>>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config)
    },
    getAllStations: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<Station[]>>(BASE_URL_UNIT_SERVICES, `/Stations${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getStationPolicyConfigurationTemplate: (url: string) => requests.getAll<Paginated<StationPolicyConfigurationTemplate[]>>(BASE_URL_UNIT_SERVICES, `/StationPolicyConfigurationTemplate/GetAll${url}`, config),
    getAllStationForDefaultUnitTemplate: (url: string) => requests.getAll<Paginated<Station[]>>(BASE_URL_UNIT_SERVICES, `/Stations/GetAllStationForDefaultUnitTemplate${url}`, config),
    getStation: (url: string) => requests.get<Station>(BASE_URL_UNIT_SERVICES, url, config),
    getAllStationInfo: (url: string) => requests.get<Station[]>(BASE_URL_UNIT_SERVICES, "/Stations/StationsInfo" + url, config),
    addStation: (body: Station) => requests.post<number>(BASE_URL_UNIT_SERVICES, "/Stations", body, config),
    updateStation: (url: string, body: Station) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body, config),
    getTemplateConfiguration: (url: string) => requests.get<ConfigurationTemplate>(BASE_URL_UNIT_SERVICES, url, config),
    getAllTemplate: () => requests.get<ConfigurationTemplate[]>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates?Size=100&Page=1", config),
    addTemplateConfiguration: (body: ConfigurationTemplate) => requests.post<number>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates", body, config),
    changeKeyValues: (url: string, body: ConfigurationTemplate) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body, config),
    getAllDeviceConfigurationTemplate: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<DeviceConfigurationTemplate[]>>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config)
    },
    getAllConfigurationValues: (url: string) => requests.get<any[]>(BASE_URL_UNIT_SERVICES, url, config),
    getTemplateConfigurationLogs: (url: string) => requests.get<ConfigurationTemplateLogs[]>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates/TemplateConfigurationLogs/" + url, config),
    deleteConfigurationTemplate: (url: string) => requests.delete<void>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates/" + url, config),
    getAllDeviceTypes: () => requests.get<DeviceType[]>(BASE_URL_UNIT_SERVICES, "/DeviceTypes?Page=1&Size=100", config),
    getDeviceType: (url: string) => requests.get<DeviceType>(BASE_URL_UNIT_SERVICES, "/DeviceTypes/" + url, config),
    postUpdateDefaultUnitTemplate: (body: DefaultUnitTemplate[]) => requests.post<void>(BASE_URL_UNIT_SERVICES, "/Stations/DefaultUnitTemplate", body, config),
    getAllCaptureDevices: () => requests.get<CaptureDevice[]>(BASE_URL_UNIT_SERVICES, "/CaptureDevices", config),
    getAllUnitStatusKeyValues: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url, config),
    getAllUnitVersionKeyValues: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url, config),
    getAllUnitTemplateKeyValues: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url, config),
    getAllUnitAssignmentKeyValues: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url, config),
    getUnitBuildVersion: () => requests.get<any>(BASE_URL_UNIT_SERVICES, "/UnitsDevices/Health/BuildVersion"),
    getFilteredDeviceByStation: (url: string, extraHeader?: Headers[]) => requests.getAll<Paginated<FilterUpdateVersion>>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getDeviceSoftwareVersion: (url: string) => requests.get<SoftwareVersion[]>(BASE_URL_UNIT_SERVICES, url, config),

    getUpdateVersions: (url: string, extraHeader?: Headers[]) => requests.get<UpdateVersion[]>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getFilteredUpdateVersions: (url: string, extraHeader?: Headers[]) => requests.getAll<Paginated<any>>(BASE_URL_UNIT_SERVICES, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    addUpdateVersions: (url: string, body: UpdateVersion) => requests.post<number>(BASE_URL_UNIT_SERVICES, url, body, config),
    putUpdateVersions: (url: string, body: any) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body, config),
    getSingleUpdateVersion: (id: number) => requests.get<UpdateVersion>(BASE_URL_UNIT_SERVICES, `/UpdateVersion/${id}`, config),
    deleteSingleUpdateVersion: (id: number) => requests.delete<void>(BASE_URL_UNIT_SERVICES, `/UpdateVersion/${id}`, config),
    syncSoftwareVersion: (url: string) => requests.get<void>(BASE_URL_UNIT_SERVICES, url, config),
    deleteAllUpdateVersions: (extraHeader?: Headers[]) => requests.delete<number>(BASE_URL_UNIT_SERVICES, `/UpdateVersion`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getStationPolicies: (stationId: number) => requests.get<StationPolicy[]>(BASE_URL_UNIT_SERVICES, `/Stations/${stationId}/StationPolicies`, config),

    addUsersToUnits: (url: string, body: AssignUsersToUnit) => requests.post<number>(BASE_URL_UNIT_SERVICES, url, body, config),
    getAllDeviceConfigurations: () => requests.get<DeviceConfigurations[]>(BASE_URL_UNIT_SERVICES, "DeviceConfigurations", config),
    retryAllUpdateVersions: (body: any) => requests.post<number>(BASE_URL_UNIT_SERVICES, `/UpdateVersion/RetryVersionUpdate`, body, config),

}

export const CommonAgent = {
    getCoutriesAlongWithStates: () => requests.get<any>(CountryStateApiUrl, '', config),
}

export const SearchAgent = {
    getAssetBySearch: (body: any, extraHeader?: Headers[]) => {
        return requests.post<any>(EVIDENCE_GET_URL, '', body, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config)
    },
    getSearchBuildVersion: () => requests.get<any>(BASE_URL_USER_SERVICE, "/Search/Health/BuildVersion"),
    getEvidenceSearch: (evidenceId: string) => requests.get<any>(EVIDENCE_GET_BY_ID_URL,`/${evidenceId}`,config)
    
}

export const CasesAgent = {
    getCasesBuildVersion: () => requests.get<any>(BASE_URL_CASES_SERVICE, "/Cases/Health/BuildVersion"),
    getAllDropDownValues: (url: string) => requests.get<any>(BASE_URL_CASES_SERVICE, url, config),

    addCase: (url: string, caseBody: Case) => requests.post<any>(BASE_URL_CASES_SERVICE, url, caseBody, config),
    editCase: (url: string, caseBody: Case) => requests.put<any>(BASE_URL_CASES_SERVICE, url, caseBody, config),

    getCase: (url: string) => requests.get<any>(BASE_URL_CASES_SERVICE, url, config),
    getAllCases: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<Cases[]>>(BASE_URL_CASES_SERVICE, `/Case/GetAll${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    // getAllCasesInfo: (url: string) => requests.get<Cases[]>(BASE_URL_Cases_SERVICE, "/Case/GetAllCases" + url, config),
    deleteCase: (url: string) => requests.delete<void>(BASE_URL_CASES_SERVICE, url, config),
    addCaseNote: (url: string, body: any) => requests.post<string>(BASE_URL_CASES_SERVICE, url, body, config),
    updateCaseNote: (url: string, body: any) => requests.put<string>(BASE_URL_CASES_SERVICE, url, body, config),
    deleteCaseNote: (url: string) => requests.delete<string>(BASE_URL_CASES_SERVICE, url, config),
    addToCaseHighlight: (url: string, body: TCaseHighlight) => requests.post<string>(BASE_URL_CASES_SERVICE, url, body, config),
    getCaseTimeline: (id: number) => requests.get<TCaseTimeline[]>(BASE_URL_CASES_SERVICE, `/Case/GetTimelineData/${id}`, config),
    updateCaseHighlight: (url: string) => requests.put<void>(BASE_URL_CASES_SERVICE, url, {}, config),
    getPredictiveCaseIds: (predictiveText: string) => requests.get<any>(BASE_URL_CASES_SERVICE, `/Case/GetPredictiveCaseIds?predictiveText=${predictiveText}`, config),
    getAllCaseSharing: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<CaseSharing[]>>(BASE_URL_CASES_SERVICE, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    addCaseSharing: (url: string, body: any) => requests.post<any>(BASE_URL_CASES_SERVICE, url, body, config),
    editCaseSharing: (url: string, body: any) => requests.put<any>(BASE_URL_CASES_SERVICE, url, body, config),
    getCaseSharing: (url: any) => requests.get<any>(BASE_URL_CASES_SERVICE, url, config),
    tagAssetsToCase: (body: any) => requests.post<any>(BASE_URL_CASES_SERVICE, `Case/AddTaggedAssetsToCase`, body, config),
    getAllCaseAudit: (url: any, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<TCaseAudit[]>>(BASE_URL_CASES_SERVICE, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    getCaseStatus: (url: string) => requests.get<CaseStatus[]>(BASE_URL_CASES_SERVICE, url, config),
    getCaseClosedReason: (url: string) => requests.get<TCaseClosedReason[]>(BASE_URL_CASES_SERVICE, url, config),
    editCaseClose: (url: string, body: any) => requests.put<string>(BASE_URL_CASES_SERVICE, url, body, config),
    addCaseClose: (url: string, body: any) => requests.post<string>(BASE_URL_CASES_SERVICE, url, body, config),
    getCaseCloseByCaseId: (url: any) => requests.get<TCaseClose[]>(BASE_URL_CASES_SERVICE, url, config),
    getCaseClose: (url: string) => requests.get<TCaseClose[]>(BASE_URL_CASES_SERVICE, url, config),
    untagAssetsToCase:(body: TCaseAsset[]) => requests.post<any>(BASE_URL_CASES_SERVICE, `Case/DeleteUntaggedAssetsToCase`, body, config),
    getAllCaseAsset: (url: any) => {
        return requests.getAll<any[]>(BASE_URL_CASES_SERVICE, url,config);
    }
}

export const ConfigurationAgent = {
    getConfigurationBuildVersion: () => requests.get<any>(BASE_URL_Configuration_SERVICE, "/Configuration/Health/BuildVersion"),
}

export const DeviceHeartBeatAgent = {
    getDeviceHeartBeatBuildVersion: () => requests.get<any>(BASE_URL_DeviceHeartBeat_SERVICE, "/HeartBeat/Health/BuildVersion"),
}

export const GvsCommandAgent = {
    getDeviceHeartBeatBuildVersion: () => requests.get<any>(BASE_URL_COMMAND_SERVICE, "/GvsCommand/Health/BuildVersion"),
}

export const useApiAgent = <T>(request: Promise<T>): [T | undefined] => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<T | undefined>(undefined);
    const dispatch = useDispatch();

    const fetchApi = () => {
        dispatch(setLoaderValue({ isLoading: true }))
        request.then((response: T) => {
            dispatch(setLoaderValue({ isLoading: false, message: "" }))
            setIsLoading(false);
            setData(response);
        }).catch((ex) => {
            dispatch(setLoaderValue({ isLoading: false, message: "", error: true }))
        })
    };
    useEffect(() => {
        fetchApi();
    }, []);
    return [data];
};

export const AICoordinatorAgent = {
    addProject: (body: Project) => requests.post<number>(AI_COORDINATOR_SERVICE_URL, '', body, config),
    updateProject: (id: number, body: Project) => requests.put<number>(AI_COORDINATOR_SERVICE_URL, `Project/${id}`, body),
    duplicateProject: (id: number, projectName: string) => requests.post<number>(AI_COORDINATOR_SERVICE_URL, `Project/${id}?projectName=${projectName}`, {}),
    addProjectJob: (projectId: number, body: Job) => requests.post<number>(AI_COORDINATOR_SERVICE_URL, `Project/${projectId}/Job`, body),
    getProjects: () => requests.get<any>(AI_COORDINATOR_SERVICE_URL, '/Project'),
    analyzeResult: (url: string) => requests.get<any>(url, ''),
    addJob: (body: Job) => requests.post<number>(AI_COORDINATOR_SERVICE_URL, '/Job', body),
    saveMetaData: (id: number, body: any) => requests.put<any>(AI_COORDINATOR_SERVICE_URL, `Job/${id}/UpdateData`, body),
    cancelJob: (id: number, body: Job) => requests.post<number>(AI_COORDINATOR_SERVICE_URL, `Job/${id}/Cancel`, body),
}

export const TrackingAndSharingAgent = {
    getTrackingAndSharingBuildVersion: () => requests.get<any>(EVIDENCE_SERVICE_URL, "/RequestTracking/Health/BuildVersion"),
    getTrackingAndSharing: (url: string) => requests.get<any>(EVIDENCE_SERVICE_URL, url, config),
    getAllTrackingAndSharing: (url: string, extraHeader?: Headers[]) => {
        return requests.getAll<Paginated<TrackingAndSharing[]>>(EVIDENCE_SERVICE_URL, `/RequestTracking/GetAllRequestTracking${url}`, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config);
    },
    deleteTracking: (url: string) => requests.delete<void>(EVIDENCE_SERVICE_URL, url, config),
    getAllSharedTypeKeyValues: (url: string) => requests.get<KeyValueMatch[]>(EVIDENCE_SERVICE_URL, url, config),
    getAllStatusKeyValues: (url: string) => requests.get<KeyValueMatch[]>(EVIDENCE_SERVICE_URL, url, config),
    getAllRequestTypeKeyValues: (url: string) => requests.get<KeyValueMatch[]>(EVIDENCE_SERVICE_URL, url, config),
    setRevokeAccess: (url: string, ids: number[]) => requests.put<void>(EVIDENCE_SERVICE_URL, url, ids, config),
}
export const GetLiveCommandDiagnostic = {
    getLiveCommandDiagnostic: (url: string, body: any) => requests.post<any>(BASE_URL_UNIT_SERVICES, url, body, config),
}

export const GetMqqtLiveStatus = {
    getMqqtLiveStatus: (station: string, unit: string) => requests.get<any>(BASE_URL_UNIT_SERVICES, `/Stations/${station}/Units/${unit}/GetUnitMqttStatusMessages/`,
        addHeaders([
            {
                key: "Tenant",
                value: "1"
            }
        ])),
};

export function getLoginId() {
    let accessToken = cookies.get('access_token');
    if (accessToken) {
        let decodedAccessToken: any = jwt_decode(accessToken);
        return decodedAccessToken.LoginId;
    }
    else {
        return "";
    }
};

export const HotListAgent = {
    getAllHotListInfosAsync: (url: string, extraHeader?: Headers[]) => requests.getAll<Paginated<any>>(BASE_URL_ALPR_Service, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getHotListInfoAsync: (url: string, extraHeader?: Headers[]) => requests.get<HotListTemplate>(BASE_URL_ALPR_Service, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    addHotListItemAsync:(url: string, body: HotListTemplate) => requests.post<number>(BASE_URL_ALPR_Service, url, body, config),
    updateHotListItemAsync:(url: string, body: any) => requests.put<void>(BASE_URL_ALPR_Service, url, body, config),
    deleteHotListItemAsync:(url: string) => requests.delete<void>(BASE_URL_ALPR_Service, url, config),
}


export const AlprCapturePlatesAgent={
    getAlprCapturePlatesInfoAsync: (url: string, extraHeader?: Headers[]) => requests.getAll<Paginated<any>>(BASE_URL_ALPR_Service, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
}
export const AlprDataSource = {
    getAllDataSourceInfoAsync: (url: string, extraHeader?: Headers[]) => requests.getAll<HotListDataSourceTemplate[]>(BASE_URL_ALPR_Service, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getDataSourceData: (url:string) => requests.get<number>(BASE_URL_ALPR_Service,url,  config),
    updateDataSource: (url:string, body: any) => requests.put<number>(BASE_URL_ALPR_Service,url, body,config),
    addDataSource:(url: string, body: any) => requests.post<number>(BASE_URL_ALPR_Service, url, body, config),
    runDataSource:(url: string) => requests.get<number>(BASE_URL_ALPR_Service, url, config),
}

const LICENSEPLATE_SERVICE_URL = 'LicensePlate'
export const LicensePlateAgent = {
    getLicensePlates: (url:string,extraHeader?: Headers[]) => requests.getAll<Paginated<LicensePlate[]>>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}`+url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
    getLicensePlateById: (id: number) => requests.get<LicensePlate>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}/${id}`, config),
    addLicensePlate: (body: LicensePlate) => requests.post<number>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}`, body, config),
    updateLicensePlate: (id: number, body: LicensePlate) => requests.put<number>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}/${id}`, body,config),
    deleteLicensePlateById: (id: number) => requests.delete<void>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}/${id}`, config),
    deleteLicensePlates: () => requests.delete<void>(BASE_URL_ALPR_Service, `${LICENSEPLATE_SERVICE_URL}`, config)
}
export const AlprPlateHistoryAgent={
    getAlprPlateHistoryInfosAsync: (url: string, extraHeader?: Headers[]) => requests.getAll<Paginated<any>>(BASE_URL_ALPR_Service, url, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config),
}
export const AlprAdvanceSearchAgent={
    getNumberPlateBySearch: (url: string, body: any, extraHeader?: Headers[]) => {
        return requests.post<any>(BASE_URL_ALPR_Service, url, body, (extraHeader && extraHeader.length > 0) ? addHeaders(extraHeader) : config)
    }
}