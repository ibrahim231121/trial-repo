import React, { useEffect, useState, useRef } from "react";
import {
  CRXTabs,
  CrxTabPanel,
  CRXButton,
  CRXAlert,
  CRXToaster,
  CRXConfirmDialog
} from "@cb/shared";
import User from "./GroupTabs/User";
import "./index.scss";
import { useHistory, useParams } from "react-router";
import Application from "./GroupTabs/Application";
import DataPermission from "./GroupTabs/DataPermission";
import GroupInfo from "./GroupTabs/GroupInfo";
import useGetFetch from "../../../../utils/Api/useGetFetch";
import {
  APPLICATION_PERMISSION_URL,
  CONTAINERMAPPING_INFO_GET_URL,
  SAVE_USER_GROUP_URL,
  UPSERT_CONTAINER_MAPPING_URL,
} from "../../../../utils/Api/url";
import { urlList, urlNames } from "../../../../utils/urlList";
import moment from "moment";
import { useDispatch } from "react-redux";
import { addNotificationMessages } from "../../../../Redux/notificationPanelMessages";
import { NotificationMessage } from "../../../Header/CRXNotifications/notificationsTypes";
import { getUsersInfoAsync } from "../../../../Redux/UserReducer";
import { enterPathActionCreator } from "../../../../Redux/breadCrumbReducer";
import { getToken } from "../../../../Login/API/auth";
import { useTranslation } from "react-i18next";
import { UsersAndIdentitiesServiceAgent } from "../../../../utils/Api/ApiAgent";
import { GroupSubModules, Module, UserGroups } from "../../../../utils/Api/models/UsersAndIdentitiesModel";
import { PageiGrid, RemoveSidePanelClass } from "../../../../GlobalFunctions/globalDataTableFunctions";
import { PermissionData } from "./GroupTabs/TypeConstant/types";
import { CRXModalDialog } from "@cb/shared";

export type GroupInfoModel = {
  name: string;
  description: string;
};
export type GroupIdName = {
  id: string;
  name: string;
};
export type DataPermissionModel = {
  containerMappingId: number;
  mappingId: number;
  permission: number;
  fieldType: number;
};
export type ApplicationPermission = {
  id: number;
  name: string;
  level: number;
  selected: boolean;
  levelType?: string;
  children?: ApplicationPermission[];
};

const Group = () => {
  const { t } = useTranslation<string>();
  const [value, setValue] = React.useState(0);
  const history = useHistory();
  const dispatch = useDispatch();
  const [groupInfo, setGroupInfo] = React.useState<GroupInfoModel>({
    name: "",
    description: "",
  });
  const [AssignToSelfPermission, setassignToSelfPermission] = React.useState<PermissionData>({
    id : -1,
    permissionLevel : { value: 0 , label: "" },
    permissionValue: { value: 0, label: "" },
    type : {value : 0, label : ""}
  });
  const [userIds, setUserIds] = React.useState<number[]>([]);

  //const [resAppPermission, setresAppPermission] = useState<any>();
  const [subModulesIds, setSubModulesIds] = React.useState<number[]>([]);
  const [showGroupScroll, setShowGroupScroll] = React.useState(false);
  const [, setMessagesadd] = useState<string>("crxScrollGroupTop");
  const [, setShowMessageCls] = useState<string>("");
  const [deletedDataPermissions, setDeletedDataPermissions] = React.useState<number[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const [isAppPermissionsChange, setIsAppPermissionsChange] =
    React.useState<boolean>(false);
  const [applicationPermissions, setApplicationPermissions] = React.useState<
    ApplicationPermission[]
  >([]);
  const [applicationPermissionsActual, setApplicationPermissionsActual] =
    React.useState<ApplicationPermission[]>([]);

  const [dataPermissions, setDataPermissions] = React.useState<
    DataPermissionModel[]
  >([ { 
      containerMappingId:0,
      mappingId:0,
      permission:0,
      fieldType:0
  }]);
  const [dataPermissionsActual, setDataPermissionsActual] = React.useState<
    DataPermissionModel[]
  >([]);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [messages, setMessages] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("inline");
  const [error, setError] = useState<string>("");

  const [showMessageError, setShowMessageError] = useState<string>("");

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] =
    useState<boolean>(true);
  const [groupIdName, setGroupIdName] = React.useState<GroupIdName>({
    id: "",
    name: "",
  });
  const [res,setRes] = React.useState<UserGroups>() 
  const [resAppPermission,setResponseAppPermission] = React.useState<Module>()
  const groupMsgRef = useRef<typeof CRXToaster>(null);
  const [pageiGrid] = React.useState<PageiGrid>({
    gridFilter: {
      logic: "and",
      filters: []
    },
    page: 0,
    size: 25,
    gridSort: {
      field: "LoginId",
      dir: "asc"
    }
  })
  const [modal, setModal] = React.useState<boolean>(false);

  function handleChange(event: any, newValue: number) {
    setValue(newValue);
  }
  const tabs = [
    { label: t("GROUP_NAME"), index: 0 },
    { label: t("USERS"), index: 1 },
    { label: t("APPLICATION_PERMISSIONS"), index: 2 },
    { label: t("DATA_PERMISSIONS"), index: 3 },
  ];
  const message = [
    { messageType: "success", message: t("User_group_saved_successfully.") },
    {
      messageType: "error",
      message:
        t("We_re_sorry_The_group_information_users_and_application_permissions_were_unable_to_be_saved__Please_retry_or_contact_your_System_Administrator."),
    },
    {
      messageType: "error",
      message:
        t("We_re_sorry_The_data_permissions_were_unable_to_be_saved._Please_retry+or_contact_your_System_Administrator."),
    },
  ];

  const { id } = useParams<{ id: string }>();
  const [ids, setIds] = useState<string>(id);
  const [getContainerMappingRes, ContainerMappingRes] = useGetFetch<any>(
    CONTAINERMAPPING_INFO_GET_URL + "?groupId=" + id,
    { "Content-Type": "application/json", TenantId: "1",'Authorization': `Bearer ${getToken()}` }
  );
  const [errorMessage, setErrorMessage]= React.useState<string>("");
  const [isDataPermissionSave, setIsDataPermissionSave]= React.useState<boolean>(false);

  React.useEffect(() => {
    functionInitialized();
    window.addEventListener("scroll", checkGroupScrollTop);
    return () => {
      dispatch(enterPathActionCreator({ val: "" }));
      window.removeEventListener("scroll", checkGroupScrollTop);
    };
  }, []);
  

  React.useEffect(() => {
    functionInitialized();
  },[isDataPermissionSave])
  

  const functionInitialized = async () => {
    //this work is done for edit, if id available then retrive data from url
    if (!isNaN(+id)) {
      await UsersAndIdentitiesServiceAgent.getUserGroupsById(ids).then((response: UserGroups) => {
        setRes(response)
     });
      //getResponse();s
      getContainerMappingRes();
    }
    await UsersAndIdentitiesServiceAgent.getResponseAppPermission(APPLICATION_PERMISSION_URL).then((response:Module ) => {
      setResponseAppPermission(response)
   });
    await dispatch(getUsersInfoAsync(pageiGrid));
  };

  const moduleAllCheck = (response: any, subModulesIdes: number[]) => {
    let count: number = 0;
    if (response.subModules && response.subModules.length > 0) {
      response.subModules.map((subModule: any) => {
        let value = subModulesIdes.indexOf(subModule.id) > -1 ? true : false;
        if (value === true) count = count + 1;
      });
      if (count === response.subModules.length) return true;
      else return false;
    } else return false;
  };

  const getPermissions = (AppPermissions: any, subModulesIdes: number[]) => {
    if (AppPermissions !== undefined) {
      let appPermission = AppPermissions.map((response: any) => {
        let x: ApplicationPermission = {
          id: response.id,
          name: response.name,
          level: 1,
          selected: moduleAllCheck(response, subModulesIdes),
          children:
            response.subModules && response.subModules.length > 0
              ? response.subModules.map((subModule: any) => {
                  let y: ApplicationPermission = {
                    id: subModule.id,
                    name: subModule.name,
                    level: 2,
                    selected:
                      subModulesIdes.indexOf(subModule.id) > -1 ? true : false,
                    levelType: subModule.subModuleGroupName,
                  };
                  return y;
                })
              : null,
        };
        return x;
      });
      return appPermission;
    }
  };

  React.useEffect(() => {
    // only for 2 levels
    if (resAppPermission !== undefined) {
      if (
        applicationPermissions === undefined ||
        applicationPermissions.length === 0
      )
        setApplicationPermissions(
          getPermissions(resAppPermission, subModulesIds)
        );
      setApplicationPermissionsActual(
        getPermissions(resAppPermission, subModulesIds)
      );
    }
  }, [resAppPermission]);

  React.useEffect(() => {
    showSave();
  }, [groupInfo, userIds, dataPermissions, isAppPermissionsChange]);

  useEffect(() => {
    if (
      applicationPermissions !== undefined &&
      applicationPermissionsActual !== undefined
    ) {
      if (
        JSON.stringify(applicationPermissions) !==
        JSON.stringify(applicationPermissionsActual)
      )
        setIsAppPermissionsChange(true);
      else setIsAppPermissionsChange(false);
    }
  }, [applicationPermissions]);

  React.useEffect(() => {
    if (res !== undefined) {
      dispatch(enterPathActionCreator({ val: res.name }));
      setGroupInfo({ name: res.name, description: res.description });
      setGroupIdName({ id: res.id, name: res.name });

      if(res?.selfPermission != null)
      {
        setassignToSelfPermission({
          id : -1,
          permissionLevel : { value: res?.selfPermission , label: "" },
          permissionValue: { value: res?.selfPermission, label: "" },
          type : {value : 3, label : ""}
        })
      }

      if (res.members !== undefined && res.members.users !== undefined) {
        let lstUserIds: number[] = [];
        res.members.users.map((x: any) => lstUserIds.push(x.id));
        setUserIds(lstUserIds);
      }

      if (res.groupSubModules !== undefined) {
        let lstSubModuleIds: number[] = [];
        res.groupSubModules.map((x: any) =>
          lstSubModuleIds.push(x.subModuleId)
        );
        setSubModulesIds(lstSubModuleIds);
      }
    }
  }, [res]);

  React.useEffect(() => {
    if (ContainerMappingRes !== undefined && id != undefined) {
      let newDataPerModel: DataPermissionModel[] = [];
      ContainerMappingRes.map((x: any) => {
        newDataPerModel.push({
          containerMappingId: parseInt(x.id),
          fieldType: x.fieldType,
          mappingId: x.mappingId,
          permission: x.groupMapping.permission,
        });
      });

      if (AssignToSelfPermission.type.value == 3) {
        newDataPerModel.push({
          containerMappingId: -1,
          fieldType: AssignToSelfPermission.type.value,
          mappingId: 3,
          permission: AssignToSelfPermission?.permissionValue?.value,
        });
      }

      if(newDataPerModel.length <= 0){
        newDataPerModel.push({
           containerMappingId:0,
            fieldType:0,
            mappingId:0,
            permission:0
        })
      }

      setDataPermissions(newDataPerModel);
      setDataPermissionsActual(newDataPerModel);
    }
  }, [ContainerMappingRes,isDataPermissionSave]);

  const onChangeGroupInfo = (name: string, decription: string) => {
    setGroupInfo({ name: name, description: decription });
  };
  const onChangeUserIds = (userIds: number[]) => {
    setUserIds(userIds);
  };

  const onChangeDataPermission = (dataPermissionModel: DataPermissionModel[]) => {
    let assignToSelfPermission = dataPermissionModel.find(x=> x.fieldType == 3);
    if (assignToSelfPermission) {
      setassignToSelfPermission({
        id: -1,
        permissionLevel: { value: assignToSelfPermission?.permission, label: "" },
        permissionValue: { value: 3, label: "" },
        type: { value: assignToSelfPermission?.fieldType, label: "" }
      });
    }
    else
    {
      setassignToSelfPermission({
        id : -1,
        permissionLevel : { value: 0 , label: "" },
        permissionValue: { value: 0, label: "" },
        type : {value : 0, label : ""}
      });
    }
    setDataPermissions(dataPermissionModel);
  };

  const redirectPage = () => {
    let groupInfo_temp: GroupInfoModel = {
      name: res?.name ?? "",
      description: res?.description ?? "",
    };

    let dataPermissionString = dataPermissions.sort(
      (a: DataPermissionModel, b: DataPermissionModel) => {
        if (a.containerMappingId < b.containerMappingId) {
          return -1;
        }
        if (a.containerMappingId > b.containerMappingId) {
          return 1;
        }
        return 0;
      }
    );

    let dataPermissionActualString = dataPermissionsActual.sort(
      (a: DataPermissionModel, b: DataPermissionModel) => {
        if (a.containerMappingId < b.containerMappingId) {
          return -1;
        }
        if (a.containerMappingId > b.containerMappingId) {
          return 1;
        }
        return 0;
      }
    );

    if (JSON.stringify(groupInfo) !== JSON.stringify(groupInfo_temp)) {
      setIsOpen(true);
      setValue(tabs[0].index);
    } else if (
      JSON.stringify(userIds.length === 0 ? "" : userIds) !==
      JSON.stringify(
        res === undefined || res.members === undefined
          ? ""
          : res.members.users.map((x: any) => x.id)
      )
    ) {
      setIsOpen(true);
      setValue(tabs[1].index);
    } else if (isAppPermissionsChange) {
      setIsOpen(true);
      setValue(tabs[2].index);
    } else if (
      JSON.stringify(dataPermissionString) !==
      JSON.stringify(dataPermissionActualString)
    ) {
      setIsOpen(true);
      setValue(tabs[3].index);
    } else
      history.push(
        urlList.filter((item: any) => item.name === urlNames.adminUserGroups)[0]
          .url
      );
  };

  const showSave = () => {
    let groupInfo_temp: GroupInfoModel = {
      name: res === undefined ? "" : res.name,
      description: res === undefined ? "" : res.description,
    };

    if (JSON.stringify(groupInfo) !== JSON.stringify(groupInfo_temp) && errorMessage.length == 0) {
      setIsSaveButtonDisabled(false);
      ValidationCheck(true)
    } else if (res !== undefined) {
      ValidationCheck();
    }
    else {

      setIsSaveButtonDisabled(true);
    }
  }; 

  function ValidationCheck(condition = false) {
    
    if (errorMessage.length !== 0) {
      setIsSaveButtonDisabled(true);
    }
    else if (res !== undefined && (
      JSON.stringify(userIds.length === 0 ? [] : userIds?.sort()) !==
      JSON.stringify(
        res.members === undefined
          ? []
          : res.members.users?.map((x: any) => x.id)?.sort())
    )) {
      setIsSaveButtonDisabled(false);
    }
    else if (JSON.stringify(applicationPermissions.sort()) !== JSON.stringify(applicationPermissionsActual.sort())) {
      setIsSaveButtonDisabled(false);
      if(isPermissionApplied() == 0) {
        setModal(true)
        setIsSaveButtonDisabled(true)
      }
        
    }
    else if(res !== undefined && dataPermissions.filter(x => x.fieldType === 0 && x.mappingId === 0 && x.permission === 0).length > 0)
    {
      setIsSaveButtonDisabled(false);
    }
    else if(dataPermissions.filter(x => x.fieldType === 0 || x.mappingId === 0 || x.permission === 0).length > 0)
    {
      setIsSaveButtonDisabled(true);
    }
    else if (
      JSON.stringify(dataPermissions) !== JSON.stringify(dataPermissionsActual)
      && dataPermissions.filter(x => x.fieldType === 0 || x.mappingId === 0 || x.permission === 0).length === 0
    ) {
      setIsSaveButtonDisabled(false);
    }
    else if (dataPermissions.every(x => x.fieldType === 0 && x.mappingId === 0 && x.permission === 0) && dataPermissionsActual.every(x => x.fieldType != 0 && x.mappingId != 0 && x.permission != 0) && deletedDataPermissions.length > 0) {
      setIsSaveButtonDisabled(false);
    }
    else {
      if (condition) {
        setIsSaveButtonDisabled(false);
      }
      else {
        setIsSaveButtonDisabled(true);
      }
    }
    
  }

  const isPermissionApplied = () => {
    let count: number = 0
    applicationPermissions.map((item: any) => {
      if(item.children !== null && item.children.length > 0) {
        item.children.map((x: any) => {
          if(x.selected === true) {
            count = count + 1
          }
        })
      }
    })
    return count
  }

  const closeDialog = () => {
    setIsOpen(false);
    history.push(
      urlList.filter((item: any) => item.name === urlNames.adminUserGroups)[0].url
    );
  };

  const getAppPermissions = (
    appPermission: any,
    onChangeAppPermissions: boolean
  ) => {
    setApplicationPermissions(appPermission);
    setIsAppPermissionsChange(onChangeAppPermissions);
  };

  const showToastMsg = () => {
    groupMsgRef.current.showToaster({
      message: message[0].message,
      variant: "success",
      duration: 7000,
      clearButtton: true,
    });
    if (message[0].message !== undefined && message[0].message !== "") {
      let notificationMessage: NotificationMessage = {
        title: t("User_Group"),
        message: message[0].message,
        type: "success",
        date: moment(moment().toDate())
          .local()
          .format("YYYY / MM / DD HH:mm:ss"),
      };
      dispatch(addNotificationMessages(notificationMessage));
    }
 };

  const onSave = () => {
    let editCase = !isNaN(+id);
    var groupURL = SAVE_USER_GROUP_URL;

    let subModules : GroupSubModules[] = applicationPermissions
    .map((x) => x.children)
    .flat(1)
    .filter((x) => x?.selected === true)
    .map((x) => {
      return { 
        id: "0",
        subModuleId: (x !== undefined ? String(x.id) : "0")
      };
    })
    let userGroup : UserGroups= {
      id: editCase ? id : "0",
      name: groupInfo.name,
      description: groupInfo.description,
      groupSubModules: subModules,
      selfPermission : AssignToSelfPermission?.permissionLevel?.value == 0 ? undefined : AssignToSelfPermission?.permissionLevel?.value,
      //  groupSubModules: subModules.map(x=> { return { "subModuleId": x?.id}}),
      //groupSubModules: appPermissionSample.map(x=> { return { "subModuleId": x.id}}),

      members: {
        users: userIds.map((x) => {  
          return { id: x };
        }),
      },
    };
    
    let groupId = 0;
    if (editCase) {
      
      groupURL = groupURL + "/" + id;
      UsersAndIdentitiesServiceAgent.editUserGroup(groupURL, userGroup)
      .then(() => {
        showToastMsg();
        groupId = parseInt(id);
        functionalityAfterRequest(groupId, 204)
      })
      .catch((error: any) => {
        if (error.response.status === 500 || error.response.status === 400) {
          setShowSuccess(true);
          functionInitialized();
          setIsAppPermissionsChange(false);
          setIsSaveButtonDisabled(true);
  
          setMessages(message[1].message);
          setError(message[1].messageType);
        } else if (error.response.status === 409 || error.response.status === 404) {
          // error = ( <div className="CrxMsgErrorGroup">We're Sorry. The Group Name <span> { error.substring(error.indexOf("'"), error.lastIndexOf("'")) }'</span> already exists, please choose a different group name.</div>)
          setShowMessageCls("showMessageGroup");
          setShowMessageError("errorMessageShow");
          setShowSuccess(true);
          setMessages(error.response.data);
          setAlertType("inline");
          setError("error");
        }
        
      });
    }
    else{
      UsersAndIdentitiesServiceAgent.addUserGroup(groupURL, userGroup)
      .then((response:any) => {
        showToastMsg();
        groupId = parseInt(response.replace(/["']/g, ""));
        functionalityAfterRequest(groupId, 201)
      })
      .catch((error: any) => {
        if (error.response.status === 500 || error.response.status === 400) {
          setShowSuccess(true);
          functionInitialized();
          setIsAppPermissionsChange(false);
          setIsSaveButtonDisabled(true);
  
          setMessages(message[1].message);
          setError(message[1].messageType);
        } else if (error.response.status === 409 || error.response.status === 404) {
          // error = ( <div className="CrxMsgErrorGroup">We're Sorry. The Group Name <span> { error.substring(error.indexOf("'"), error.lastIndexOf("'")) }'</span> already exists, please choose a different group name.</div>)
          setShowMessageCls("showMessageGroup");
          setShowMessageError("errorMessageShow");
          setShowSuccess(true);
          setMessages(error.response.data);
          setAlertType("inline");
          setError("error");
        }
        
      });
    }
    
  };

  const functionalityAfterRequest = (groupId: number, status: number) => {
    let permissionsToAdd = dataPermissions.filter(x=> x.fieldType !== 0  && x.mappingId !== 0 && x.permission !== 0 )
                                          .map((x) => {
                                            return {
                                              id: x.containerMappingId,
                                              mappingId: x.mappingId,
                                              groupMapping: {
                                                groupId: groupId,
                                                permission: x.permission,
                                              },
                                              fieldType: x.fieldType,
                                            };
                                          });
    permissionsToAdd = permissionsToAdd.filter(x=> x.fieldType !== 3);
    let assignToSelfPermissionObj = dataPermissions.find(x=>x.fieldType == 3 && x.containerMappingId > 0);
    let deletedPermissions = deletedDataPermissions;
    if(assignToSelfPermissionObj)
    {
      deletedPermissions.push(assignToSelfPermissionObj?.containerMappingId)
    }
    permissionsToAdd = permissionsToAdd.filter(x=>x.fieldType !=3).map((x) => {
      let containerMappingId = x?.id == -1 ? 0 : x?.id ;
      return {
        id: containerMappingId,
        mappingId: x.mappingId,
        groupMapping: {
          groupId: groupId,
          permission: x?.groupMapping?.permission,
        },
        fieldType: x.fieldType,
      };
    });
                                         
    let dataPermissionObj = {
      //  groupId : id,
      containerMappings: permissionsToAdd,
      deletedContainerMappingIds: deletedPermissions,
      groupId:groupId
    };

    fetch(UPSERT_CONTAINER_MAPPING_URL, {
      method: "PUT",
      headers: {
        TenantId: "1",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(dataPermissionObj),
    })
  
    .then((container) => {
        if (container.status === 201 || container.status === 204) {
          // pushToHistory(urlList.filter((item:any) => item.name === urlNames.adminUserGroups)[0].url);
          // showToastMsg();
          
          setIsDataPermissionSave(true)
          setIsSaveButtonDisabled(true)
        } else 
        if (
          container.status === 500 ||
          container.status === 400 ||
          container.status === 409 ||
          container.status === 404
        ) {
          effectAfterSave(groupId.toString(),container.status, true)
          setAlertType("inline");
          setMessages(message[2].message);
          setError(message[2].messageType);
          return;
        }
        
      })
      .catch((error: any) => {
        if (error.response.status === 500 || error.response.status === 400) {
          setShowSuccess(true);
          functionInitialized();
          setIsAppPermissionsChange(false);
          setIsSaveButtonDisabled(true);
  
          setMessages(message[1].message);
          setError(message[1].messageType);
        } else if (error.response.status === 409 || error.response.status === 404) {
          let errorJson = JSON.parse(error);
  
          // error = ( <div className="CrxMsgErrorGroup">We're Sorry. The Group Name <span> { error.substring(error.indexOf("'"), error.lastIndexOf("'")) }'</span> already exists, please choose a different group name.</div>)
          effectAfterSave(groupId.toString(),status, true)
          setShowMessageCls("showMessageGroup");
          setShowMessageError("errorMessageShow");
  
          setMessages(errorJson);
          setAlertType("inline");
          setError(message[1].messageType);
        }
        return;
      });
      
    effectAfterSave(groupId.toString(),status, false)
   }
  

  useEffect(() => {
    if (ids !== undefined)  
     UsersAndIdentitiesServiceAgent.getUserGroupsById(ids).then((response: UserGroups) => {
      setRes(response)
   });
  }, [ids]);

  const effectAfterSave = (groupId: string,status: number, bl:boolean) => {
    setShowSuccess(bl);
    functionInitialized();
    if(status != 409  ){
      redirectingToId(groupId);
    }
    setIsAppPermissionsChange(false);
    setIsSaveButtonDisabled(true);
  }

  const redirectingToId = (groupId: string) => {
    let urlPathName = urlList.filter(
      (item: any) => item.name === urlNames.adminUserGroupId
    )[0].url;
    setIds(groupId);
    history.push(
      urlPathName.substring(0, urlPathName.lastIndexOf("/")) + "/" + groupId
    );
  };

  const checkGroupScrollTop = () => {
    if (!showGroupScroll && window.pageYOffset > 15) {
      setShowGroupScroll(true);
      setMessagesadd("crxScrollGroup");
    } else if (!showGroupScroll && window.pageYOffset <= 15) {
      setShowGroupScroll(false);
      setMessagesadd("crxScrollGroupTop");
    }
  };

  const alertMsgDiv = showSuccess ? " " : "hideMessageGroup";

  useEffect(() => {
    if (messages !== undefined && messages !== "") {
      let notificationMessage: NotificationMessage = {
        title: "Group",
        message: messages,
        type: error,
        date: moment(moment().toDate())
          .local()
          .format("YYYY / MM / DD HH:mm:ss"),
      };
      dispatch(addNotificationMessages(notificationMessage));
    }
  }, [messages]);

  useEffect(() => {
    RemoveSidePanelClass()
  },[])
  return (
    <div className="crxTabsPermission" style={{}}>
      {showSuccess && showSuccess ? <CRXAlert
        className={"CrxAlertNotificationGroup " + " " + alertMsgDiv}
        message={messages}
        type={error}
        open={showSuccess}
        alertType={alertType}
        setShowSucess={setShowSuccess}
      />
     : ""}
      <CRXToaster ref={groupMsgRef} />

      <CRXTabs value={value} onChange={handleChange} tabitems={tabs} stickyTab={130}/>
      
        <CrxTabPanel value={value} index={0}>
          {/* <div className={showMessageError}> */}
          <div
            className={`${showMessageError} ${
              alertType == "inline" ? "" : "errorGroupInfo"
            }`}
          >
            <GroupInfo info={groupInfo} onChangeGroupInfo={onChangeGroupInfo} setIsSaveButtonDisabled={setIsSaveButtonDisabled} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
          </div>
        </CrxTabPanel>

      <CrxTabPanel value={value} index={1}>
        <div
          className="crxGroupTab1"
        >
          <User ids={userIds} onChangeUserIds={onChangeUserIds}></User>
        </div>
      </CrxTabPanel>

        <CrxTabPanel value={value} index={2}>
          {/* <div
            onClick={scrollGroupTop}
            className={`${
              showSuccess ? "hiddenArea isErrorHide" : "hiddenArea"
            } ${messagesadd}`}
          ></div> */}
          <Application
            resAppPermission={resAppPermission}
            applicationPermissions={applicationPermissions}
            onSetAppPermissions={getAppPermissions}
            groupIdName={groupIdName}
            isAppPermissionsChange={isAppPermissionsChange}
          ></Application>
        </CrxTabPanel>

        <CrxTabPanel value={value} index={3}>
          <div className="crxGroupTab3">
          <DataPermission
            AssignToSelfPermission={AssignToSelfPermission}
            setassignToSelfPermission={setassignToSelfPermission}
            dataPermissionsInfo={dataPermissions}
            onChangeDataPermission={onChangeDataPermission}
            onDeletePermission={(id: number) => {
              var deletedPermissions = deletedDataPermissions;
              deletedPermissions.push(id);
              setDeletedDataPermissions(deletedPermissions);
            }}
          ></DataPermission>
          </div>
        </CrxTabPanel>

        <div className="tab-bottom-buttons stickyFooter_Tab">
          <div className="save-cancel-button-box">
            <CRXButton
              variant="contained"
              className="groupInfoTabButtons"
              onClick={onSave}
              disabled={isSaveButtonDisabled}
            >
              {t("Save")}
            </CRXButton>
            <CRXButton
              className="groupInfoTabButtons secondary"
              color="secondary"
              variant="outlined"
              onClick={() =>
                history.push(
                  urlList.filter(
                    (item: any) => item.name === urlNames.adminUserGroups
                  )[0].url
                )
              }
            >
              {t("Cancel")}
            </CRXButton>
          </div>
          <CRXButton
            onClick={() => redirectPage()}
            className="groupInfoTabButtons-Close secondary"
            color="secondary"
            variant="outlined"
          >
            {t("Close")}
          </CRXButton>
        </div>

        <CRXConfirmDialog
          setIsOpen={() => setIsOpen(false)}
          onConfirm={closeDialog}
          isOpen={isOpen}
          className="userGroupNameConfirm"
          primary={t("Yes_close")}
          secondary={t("No,_do_not_close")}
          text="user group form"
        >
          <div className="confirmMessage __crx__Please__confirm__modal">
            {t("You_are_attempting_to")} <strong> {t("close")}</strong> {t("the")}{" "}
            <strong>{t("'user_group_form'")}</strong>. {t("If_you_close_the_form")}, 
            {t("any_changes_you_ve_made_will_not_be_saved.")} {t("You_will_not_be_able_to_undo_this_action.")}
            <div className="confirmMessageBottom">
            {t("Are_you_sure_you_would_like_to")} <strong>{t("close")}</strong> {t("the_form?")}
            </div>
          </div>
        </CRXConfirmDialog>
        <CRXModalDialog
          className='createTracking CrxCreateTracking'
          style={{ minWidth: '680px' }}
          maxWidth='xl'
          title={<b>Attention !</b>}
          modelOpen={modal}
          onClose={(e: React.MouseEvent<HTMLElement>) => setModal(false)}
        >
          <br></br>
          <div>All the permissions are 'Unchecked'</div>
          <div className="modalFooter CRXFooter">
          <div className="cancelBtn">
            <CRXButton
              className="secondary"
              color="secondary"
              variant="outlined"
              onClick={() => setModal(false)}
            >
              {t("Close")}
            </CRXButton>
          </div>
            </div>

        </CRXModalDialog>

    </div>
  );
};

export default Group;
