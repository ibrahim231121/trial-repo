import { History } from "../../../Application/Admin/Station/DefaultUnitTemplate/DefaultUnitTemplateModel";


export interface UsersInfo {
    email: string,
    fName: string,
    lName: number
    lastLogin: Date,
    recId: number,
    status: string
    userGroups: string,
    loginId: string,
    headers: any
}

export interface UserGroups {
    description:string,
    groupSubModules:GroupSubModules[],
    history?:History,
    id:string,
    members:Members,
    name:string
    selfPermission? : number;
}

export interface ADGroups {
    GuidIdentifier:boolean,
    uniqueId:string,
    Status:boolean,
    history?:History,
    id:number,
    PdRecId:Number,
    name:string

}
export type AddGroup = {
    id:number,
    rowId : number,
    adGroupRecId: number,
    adGroupObj?: KeyValue,
    groupRecIds: number [],
    groupObj?: KeyValue[],
    isChanged : boolean,
    serverType : number
}
export type KeyValue = {
    value: string;
    label: string;
}
export interface Members{
    users: MemberId[]
}

export interface MemberId{
    id: Number
}

export interface GroupSubModules{
    history?:History,
    id:string,
    permission?:number,
    subModuleId:string
}

export interface Member {
    users:Number[],
    childGroups:Number[],   
}

export interface GroupUserCount {
    group:number,
    userCount:number,   
}

export interface UserList {
    account: AccountBase,
    userGroups: UserGroupsDetail[],   
}

export interface UserStatus{
    id: Number,
    name: string
}

export interface AccountBase {
    status: string,
    loginId: string,
    lastLogin: Date,
    isAdministrator: boolean,
    passwordDetail: PasswordDetail,
    isPasswordResetRequired: boolean
}

export interface UserGroupsDetail {
    groupId: number,
    groupName: string
}

export interface PasswordDetail {
    expiresOn: Date,
    numberOfInvalidAttempts: number
}

export interface User {
    email: string;
    deactivationDate: string;
    name: {
        first: string;
        last: string;
        middle: string;
    };
    account: Account;
    mobileNumber: string;
    assignedGroupIds: any[] | undefined;
    timeZone: string;
    pin? : string | null;
}
export interface Account {
    isAdministrator: number;
    lastLogin: Date;
    passwordDetail: any;
    status: number;
    loginId: string;
    password: string;
    isPasswordResetRequired: boolean;

}

export interface Module {
   id: number,
   name: string,
   appId: number,
   description: string,
   history: History,
   subModules: SubModule[]

}
export interface SubModule {
    id: number,
    name: string,
    subModuleGroupName: string,
    description: string
 }

 export interface GroupList{
    members: MemberList 

 }
 export interface MemberList{
    users: UserList[],
    childGroups: Number[]

 }