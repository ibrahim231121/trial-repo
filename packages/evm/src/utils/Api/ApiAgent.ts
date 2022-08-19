import axios, { AxiosError, AxiosResponse } from 'axios';
import { StringIfPlural } from 'react-i18next';
import { Category, Forms } from './models/CategoryModels';
import { Policy } from './models/PolicyModels';
import { AddOwner, 
    Asset, 
    AssetSharingModel, 
    AssetViewReason, 
    Bookmark, 
    Evidence, 
    ExtendRetention,
    File, 
    Note, 
    TimelinesSync,
    EvdenceCategoryAssignment, 
    SubmitAnalysisModel } from './models/EvidenceModels';
import { 
    JOBCOORDINATOR_SERVICE_URL,
    EVIDENCE_SERVICE_URL,
    BASE_URL_USER_SERVICE, 
    SETUP_CONFIGURATION_SERVICE_URL ,
    USER_INFO_GET_URL,
    GROUP_USER_LIST,
    USER,GROUP_GET_URL,
    GROUP_GET_BY_ID_URL,
    GROUP_USER_COUNT_GET_URL,
    SAVE_USER_GROUP_URL,
    BASE_URL_UNIT_SERVICES, 
    FILE_SERVICE_URL } from './url';
import { getVerificationURL } from "../../utils/settings";
import {Token} from './models/AuthenticationModels';
import Cookies from 'universal-cookie';
import {UsersInfo,UserGroups,GroupUserCount, UserList, User, Module, GroupList} from './models/UsersAndIdentitiesModel'
import { 
    ConfigurationTemplate, 
    ConfigurationTemplateLogs, 
    DefaultConfigurationTemplate, 
    DefaultUnitTemplate, 
    DeviceConfigurationTemplate, 
    DeviceType, 
    GetPrimaryDeviceInfo, 
    Unit, 
    UnitInfo, 
    UnitTemp, 
    UnitTemplateConfigurationInfo } from './models/UnitModels';
import { Station } from './models/StationModels';
import { Paginated } from './models/CommonModels';
const cookies = new Cookies();

let config = {
    
    headers: {
        'Content-Type': 'application/json',
        'TenantId': '1',
        'Authorization': 'Bearer ' + cookies.get("access_token")
    }
}


axios.interceptors.response.use(async response => {
    try {
        return response;
    } catch (ex) {
        return await Promise.reject(ex);
    }
}, async (error : AxiosError) => {
    console.log(error.request.responseURL + ", error code: " + error.response?.status);
    return Promise.reject(error);
})

const responseBody = <T>(response: AxiosResponse<T>) => {
    // let totalCount = response.headers["x-total-count"];
    // if(totalCount !== undefined)
    // {
    //     let paginatedResponse = {
    //         data: response.data,
    //         totalCount: parseInt(totalCount)
    //     }
    //     return paginatedResponse;
    // }
    return response.data;
};
const setBaseUrl = (baseUrl: string) => axios.defaults.baseURL = baseUrl;

const requests = {
    get: <T>(baseUrl: string, url: string) => {setBaseUrl(baseUrl); return axios.get<T>(url,config).then(responseBody)},
    post: <T>(baseUrl: string, url: string, body: {}) => {setBaseUrl(baseUrl); return axios.post<T>(url, body, config).then(responseBody)},
    put: <T>(baseUrl: string, url: string, body: {}) => {setBaseUrl(baseUrl); return axios.put<T>(url, body, config).then(responseBody)},
    patch: <T>(baseUrl: string, url: string, body: {}) => {setBaseUrl(baseUrl); return axios.patch<T>(url, body, config).then(responseBody)},
    delete: <T>(baseUrl: string, url: string) => {setBaseUrl(baseUrl); return axios.delete<T>(url, config).then(responseBody)},
    post_noconfig: <T>(baseUrl: string, url: string, body: {}) => {setBaseUrl(baseUrl); return axios.post<T>(url, body).then(responseBody)},

}
export const SetupConfigurationAgent = {
    getCategories: (url: string) => requests.get<Category[]>(SETUP_CONFIGURATION_SERVICE_URL, url),
    getPoliciesAccordingToType: (url: string) => requests.get<Policy[]>(SETUP_CONFIGURATION_SERVICE_URL, url),
}
export const EvidenceAgent = {
    getEvidences: () => requests.get<Evidence[]>(EVIDENCE_SERVICE_URL, '/Evidences'),
    getEvidence: (evidenceId: number) => requests.get<Evidence>(EVIDENCE_SERVICE_URL, '/Evidences/' + evidenceId),
    getAsset: (url: string) => requests.get<Asset>(EVIDENCE_SERVICE_URL, url),
    getAssetFile: (url: string) => requests.get<File[]>(EVIDENCE_SERVICE_URL, url),

    isStationExistsinEvidence: (url: string) => requests.get<number>(EVIDENCE_SERVICE_URL, url),
    addAsset: (url: string, body: Asset) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body),
    getEvidenceCategories: (evidenceId: number) => requests.get<Evidence>(EVIDENCE_SERVICE_URL, '/Evidences/' + evidenceId),
    addBookmark: (url: string, body: Bookmark) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body),
    updateBookmark: (url: string, body: Bookmark) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body),
    deleteBookmark: (url: string) => requests.delete<void>(EVIDENCE_SERVICE_URL, url),
    addNote: (url: string, body: Note) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body),
    updateNote: (url: string, body: Note) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body),
    deleteNote: (url: string) => requests.delete<void>(EVIDENCE_SERVICE_URL, url),
    timelineSync: (url: string, body: TimelinesSync[]) => requests.patch<void>(EVIDENCE_SERVICE_URL, url, body),
    addAssetViewReason: (url: string, body: AssetViewReason) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body),
    addUsersToMultipleAsset: (url: string, body: AddOwner[]) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body),
    addUsersToAsset: (url: string, body: number[]) => requests.post<number>(EVIDENCE_SERVICE_URL, url, body),
    setPrimaryAsset: (url: string) => requests.get<void>(EVIDENCE_SERVICE_URL, url),
    updateRetentionPolicy: (url: string, body: ExtendRetention[]) => requests.put<void>(EVIDENCE_SERVICE_URL, url, body),
    changeCategories: (url: string, body: EvdenceCategoryAssignment) => requests.patch<void>(EVIDENCE_SERVICE_URL, url, body),
    shareAsset: (url: string, body?: AssetSharingModel) => requests.post<void>(EVIDENCE_SERVICE_URL, url, body ?? {}),
    submitAnalysis: (url: string, body?: SubmitAnalysisModel) => requests.post_noconfig<void>(JOBCOORDINATOR_SERVICE_URL, url, body ?? {}),

}

export const AuthenticationAgent = {
    getAccessToken: (url:string) => requests.get<Token>(getVerificationURL(url),'')
}

export const FileAgent = {
    getDownloadFileUrl: (fileId:number) => requests.get<string>(FILE_SERVICE_URL,'/Files/download/' + fileId)
}

export const UsersAndIdentitiesServiceAgent = {
    getUsersInfo: (url:string, body: any) => requests.post<UsersInfo[]>(USER_INFO_GET_URL,'',body),
    getUsersGroups: () => requests.get<UserGroups[]>(GROUP_GET_URL,''),
    getUserGroupCount: () => requests.get<GroupUserCount[]>(GROUP_USER_COUNT_GET_URL,''),
    getUser:(userId: string) => requests.get<UserList>(USER , `/${userId}`),
    addUser: (url: string, body: User) => requests.post<number>(BASE_URL_USER_SERVICE,url, body),
    editUser: (url: string, body: User) => requests.put<number>(BASE_URL_USER_SERVICE,url, body),
    getResponseAppPermission: (url: string) => requests.get<Module>(BASE_URL_USER_SERVICE, url),
    updateUserInfoURL: (url: string, body: any) => requests.patch<void>(BASE_URL_USER_SERVICE, url, body),
    getUserGroupsById:(id: string) => requests.get<UserGroups>(GROUP_GET_BY_ID_URL , `/${id}`),
    getSelectedUserGroups:(id: string) => requests.get<UserGroups>(GROUP_GET_BY_ID_URL , `/${id}`),
    addUserGroup:(url: string, body: UserGroups) => requests.post<number>(GROUP_GET_BY_ID_URL , url, body),
    editUserGroup:(url: string, body: UserGroups) => requests.put<void>(GROUP_GET_BY_ID_URL , url, body)
}
export const UnitsAndDevicesAgent = {
    getAllUnits: (url: string) => requests.get<Unit[]>(BASE_URL_UNIT_SERVICES, url),
    getUnit: (url: string) => requests.get<Unit>(BASE_URL_UNIT_SERVICES, url),
    getConfigurationTemplateList: (url: string) => requests.get<UnitTemplateConfigurationInfo[]>(BASE_URL_UNIT_SERVICES, url),
    getPrimaryDeviceInfo: (url: string) => requests.get<GetPrimaryDeviceInfo>(BASE_URL_UNIT_SERVICES, url),
    changeUnitInfo: (url: string, body: UnitTemp) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body),
    deleteUnit: (url: string) => requests.delete<void>(BASE_URL_UNIT_SERVICES, url),
    getUnitInfo: () => requests.get<UnitInfo[]>(BASE_URL_UNIT_SERVICES, "/Stations/0/Units/getunitInfo?Page=1&Size=100"),
    getAllStations: (url: string) => requests.get<Station[]>(BASE_URL_UNIT_SERVICES, "/Stations"+url),
    getStation: (url: string) => requests.get<Station>(BASE_URL_UNIT_SERVICES, url),
    getAllStationInfo: (url: string) => requests.get<Station[]>(BASE_URL_UNIT_SERVICES, "/Stations/GetAllStationInfo"+url),
    addStation: (body: Station) => requests.post<number>(BASE_URL_UNIT_SERVICES, "/Stations", body),
    updateStation: (url: string, body: Station) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body),
    getTemplateConfiguration: (url: string) => requests.get<DefaultConfigurationTemplate>(BASE_URL_UNIT_SERVICES, url),
    getAllTemplate: () => requests.get<ConfigurationTemplate[]>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates?Size=100&Page=1"),
    addTemplateConfiguration: (body: ConfigurationTemplate) => requests.post<number>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates", body),
    changeKeyValues: (url: string, body: ConfigurationTemplate) => requests.put<void>(BASE_URL_UNIT_SERVICES, url, body),
    getAllDeviceConfigurationTemplate: () => requests.get<DeviceConfigurationTemplate[]>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates/GetAllConfiguration?Page=1&Size=100"),
    getTemplateConfigurationLogs: (url: string) => requests.get<ConfigurationTemplateLogs[]>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates/GetTemplateConfigurationLogs/"+url),
    deleteConfigurationTemplate: (url: string) => requests.delete<void>(BASE_URL_UNIT_SERVICES, "/ConfigurationTemplates/"+url),
    getAllDeviceTypes: () => requests.get<DeviceType[]>(BASE_URL_UNIT_SERVICES, "/DeviceTypes?Page=1&Size=100"),
    getDeviceType: (url: string) => requests.get<DeviceType>(BASE_URL_UNIT_SERVICES, "/DeviceTypes/"+url),
    postUpdateDefaultUnitTemplate: (body: DefaultUnitTemplate[]) => requests.post<void>(BASE_URL_UNIT_SERVICES, "/Stations/DefaultUnitTemplate", body),
}
