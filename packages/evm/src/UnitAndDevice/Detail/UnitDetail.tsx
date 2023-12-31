import React, { useState, useRef, useLayoutEffect } from "react";
import {
  CRXTabs,
  CrxTabPanel,
  CRXButton,
  CRXToaster,
} from "@cb/shared";
import { useHistory } from "react-router";
import UnitConfigurationInfo from "./UnitConfigurationInfo";
import useGetFetch from "../../utils/Api/useGetFetch";
import BC02 from "../../Assets/Images/BC02.png";
import BC03 from "../../Assets/Images/BC03.png";
import DVRVRX20 from "../../Assets/Images/DVR-VR-X20.png";
import BC04 from "../../Assets/Images/BC04.png";
import MASTERDOCK from "../../Assets/Images/Master-Dock.png";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import { CRXConfirmDialog, CRXDataTable } from "@cb/shared";
import { urlList, urlNames } from "../../utils/urlList";
import "./UnitDetail.scss";
import { enterPathActionCreator } from "../../Redux/breadCrumbReducer";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import textDisplay from "../../GlobalComponents/Display/TextDisplay";
import {
  HeadCellProps,
  onResizeRow,
  Order,
  onSetSingleHeadCellVisibility,
  onClearAll,
  PageiGrid
} from "../../GlobalFunctions/globalDataTableFunctions";
import UnitAndDevicesActionMenu from "../UnitAndDevicesActionMenu";
import Cookies from 'universal-cookie';
import QueuedAsstsDataTable from "./AssetQueuedDataTable";
import { EvidenceAgent, UnitsAndDevicesAgent } from "../../utils/Api/ApiAgent";
import { Device, GetPrimaryDeviceInfo, QueuedAssets, Unit, UnitAndDevice, UnitTemp, UnitTemplateConfigurationInfo, } from "../../utils/Api/models/UnitModels";
import { Station } from "../../utils/Api/models/StationModels";
import UnitDeviceEvents from "./UnitDeviceEvents";
import UnitDeviceDiagnosticLogs from "./UnitDeviceDiagnosticLogs";
import { CBXLink } from "@cb/shared";
import { MAX_REQUEST_SIZE_FOR } from "../../utils/constant";
import { setLoaderValue } from "../../Redux/loaderSlice";
import { getStationsInfoAllAsync } from "../../Redux/StationReducer";
import { RootState } from "../../Redux/rootReducer";
import { subscribeGroupToSocket, unSubscribeGroupFromSocket } from "../../utils/hub_config";
import Restricted from "../../ApplicationPermission/Restricted";
import moment from "moment";
import LiveDiagnostic from "./LiveDiagnostics/LiveDiagnostic";
import { CRXTooltip } from "@cb/shared";
import { CRXModalDialog } from "@cb/shared";
import UnitDeviceAssignUser from "../UnitDeviceAssignUser";
const cookies = new Cookies();

export type UnitInfoModel = {
  name: string;
  description: string;
  groupName: string;
  configTemp: any;
  configTemplateList: any;
  stationList: any;
  stationId: any;
  allconfigTemplateList: any;
  lastCheckedIn: any
};


type stateProps = {
  template: any;
  unitId: any;
  stationId: any;
  deviceType: any;
  deviceTypeName: any;

};

type locationProps = {
  state: stateProps;
};

type historyProps = {
  location: locationProps;
};

const UnitCreate = (props: historyProps) => {
  const { location } = props;

  const [value, setValue] = React.useState(0);
  const history = useHistory();
  const dispatch = useDispatch();

  const [unitInfo, setUnitInfo] = React.useState<UnitInfoModel>({
    name: "",
    description: "",
    groupName: "",
    configTemp: "",
    configTemplateList: [],
    stationList: [],
    stationId: "",
    allconfigTemplateList: [],
    lastCheckedIn: []
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation<string>();
  const [showSuccess,] = useState<boolean>(false);
  const [showMessageError] = useState<string>("");
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState<boolean>(true);
  const [rows, setRows] = React.useState<UnitAndDevice[]>([]);
  const [order] = React.useState<Order>("asc");
  const [orderBy] = React.useState<string>("name");
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedActionRow, setSelectedActionRow] = React.useState<UnitAndDevice>();
  const [selectedItems, setSelectedItems] = React.useState<UnitAndDevice[]>([]);
  const [queuedAssets, setQueuedAssets] = React.useState<number>(0);
  const [assetsCount, setAssetCount] = React.useState<number>(0);
  const [reformattedRows, setReformattedRows] = React.useState<UnitAndDevice[]>();
  const targetRef = React.useRef<typeof CRXToaster>(null);
  const alertRef = useRef(null);
  const [alertType] = useState<string>('inline');
  const [errorType] = useState<string>('error');
  const [responseError] = React.useState<string>('');
  const [alert] = React.useState<boolean>(false);
  const [openAssignUser, setOpenAssignUser] = React.useState(false);
  const statusJson = useRef<any>(null);
  const [unitStatus, setUnitStatus] = useState<any>();
  const [stationName, SetStationName] = React.useState<string>('');
  const [stationID, SetStationID] = React.useState<any>(location.state.stationId);

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(25);
  const [paging, setPaging] = React.useState<boolean>();
  const [pageiGrid, setPageiGrid] = React.useState<PageiGrid>({
    gridFilter: {
      logic: "and",
      filters: []
    },
    page: page,
    size: rowsPerPage
  })
  const tenMinutes: number = 10;

  function handleChange(event: any, newValue: number) {
    setValue(newValue);
    const overlay: any = document.getElementsByClassName("overlayPanel");
    overlay.length > 0 && (overlay[0].style.width = "28px")
  }

  const unitID = location.state.unitId;
  const inCarTab: any = location.state.deviceType;


  const tabs1 = [
    { label: t("Configuration"), index: 0 },
    { label: t("Queued_Assets_Caps"), index: 1 },
    { label: t("Events"), index: 2 },
    { label: t("Device_Diagnostic"), index: 3 },
    { label: t("Update_History"), index: 4 },
    { label: t("Live_Diagnostic"), index: 5 },
  ];

  const tabs = [
    { label: t("Configurations"), index: 0 },
    { label: t("Devices"), index: 1 },
    { label: t("Queued_Assets_Caps"), index: 2 },
    { label: t("Events"), index: 3 },
    { label: t("Device_Diagnostic"), index: 4 },
    { label: t("Live_Diagnostic"), index: 5 },
  ];
  const [allconfigTemplateList, setAllconfigTemplateList] = useState<any[]>([]);
  const [configTemplateList, setConfigTemplateList] = useState<any[]>([]);
  const [primaryDeviceInfo, setPrimaryDeviceInfo] = useState<any>();
  const stationList: any = useSelector((state: RootState) => state.stationReducer.stationInfo);
  const [IsformUpdated, setIsformUpdated] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [filterGroupValue, setFilterGroupValue] = React.useState<any>([]);
  const toasterRef = useRef<typeof CRXToaster>(null);
  const [filterValue, setFilterValue] = React.useState<any>([]);

  React.useEffect(() => {
    singleEventListener("onWSMsgRecEvent", onMsgReceived);
    subscribeGroupToSocket("UnitStatus");
    UnitsAndDevicesAgent.getPrimaryDeviceInfo("/Stations/" + stationID + "/Units/" + unitID + "/PrimaryDeviceInfo").then((response: GetPrimaryDeviceInfo) => {
      response.id = unitID;
      setPrimaryDeviceInfo(response);
      if (response != undefined) {
        let currentTime = new Date();
        let tenMinutesAddedInlastCheckedIn = moment(response.lastCheckedIn).add(tenMinutes, 'm').toDate();
        if (tenMinutesAddedInlastCheckedIn < currentTime && response.status != "Inactive") {
          setUnitStatus("OFFLINE");
        }
        else {
          setUnitStatus(response.status.toUpperCase());
        }
      }
    });
    EvidenceAgent.getQueuedAssets(unitID).then((response: QueuedAssets[]) => setQueuedAssets(response.filter(x => x.fileState == "Uploading").length));
    EvidenceAgent.GetAssetsForUnit(unitID).then((response) => {
      setAssetCount(response)
    })
    UnitsAndDevicesAgent.getConfigurationTemplateList("/Stations/" + stationID + "/Units/" + unitID + "/ConfigurationTemplate").then((response: UnitTemplateConfigurationInfo[]) => {

      setConfigTemplateList(response)
      var result = response.map((x: any) => { return { displayText: x.name, value: x.id, stationId: x.stationId } })
      setAllconfigTemplateList(result)
    });
    dispatch(getStationsInfoAllAsync());
    UnitsAndDevicesAgent.getUnit("/Stations/" + stationID + "/Units/" + unitID + "/UnitDeviceBannerInfo").then((response: UnitAndDevice[]) => {
      let unitAndDevicesRows: UnitAndDevice[] = [];
      if (response != undefined) {

        unitAndDevicesRows = response.map((data) => {
          return {
            deviceName: data.deviceName,
            deviceType: data.deviceType,
            description: data.description,
            status: data.status,
            version: data.version
          };
        });
        setRows(unitAndDevicesRows);

      }

    });
    return () => {
      dispatch(enterPathActionCreator({ val: "" }));
      singleEventListener("onWSMsgRecEvent");
      unSubscribeGroupFromSocket("UnitStatus");
    };
  }, []);

  React.useEffect(() => {
    showSave();
  }, [unitInfo]);

  React.useEffect(() => {
    if (primaryDeviceInfo && configTemplateList && stationList && configTemplateList.length > 0 && stationList.length > 0) {
      SetStationName(primaryDeviceInfo.station)
      let template: any = [{ displayText: t("None"), value: "0", stationId: null }];
      configTemplateList.map((x: any) => {
        template.push({ displayText: x.name, value: x.id, stationId: x.stationId });
      });


      let stationlst: any = [{ displayText: t("None"), value: "0" }];
      stationList.map((x: any) => {
        stationlst.push({ displayText: x.name, value: x.id });
      });

      setUnitInfo({
        name: primaryDeviceInfo.name,
        description: primaryDeviceInfo.description,
        groupName: primaryDeviceInfo.triggerGroup,
        configTemp: primaryDeviceInfo.configTemplateId,
        configTemplateList: template,
        stationList: stationlst,
        stationId: stationID,
        allconfigTemplateList: allconfigTemplateList,
        lastCheckedIn: primaryDeviceInfo.lastCheckedIn
      });
      dispatch(
        enterPathActionCreator({
          val:
            t("Unit_Detail") +
            primaryDeviceInfo.name.charAt(0).toUpperCase() +
            primaryDeviceInfo.name.slice(1),
        })
      );
    }
  }, [primaryDeviceInfo, configTemplateList, stationList, allconfigTemplateList]);

  // React.useEffect(() => {

  //   var templates = filterTemplatesByStation(allconfigTemplateList, unitInfo.stationId);
  //   console.log(templates, "templates")
  //   setConfigTemplateList(templates)
  // }, [unitInfo])
  const UpdateDescription = (status: string) => {
    switch (status) {
      case "Offline":
        return "Offline"
      case "Live":
        return "Live Streaming"
      case "Recording":
        return "Recording"
      case "StandBy":
        return "Standby"
      case "Online":
        return "Online"
      case "OnlineWithGETAC":
        return "Online with GETAC"
      case "UnitBeingDiagnosed":
        return "Live Diagnosis"
      case "Unregistered":
        return "Unregistered"
      default:
        return "";
    }
  }
  function onMsgReceived(e: any) {
    if (e != null && e.data != null && e.data.body != null) {
      statusJson.current = JSON.parse(e.data.body.data);
      statusJson.current.Data = UpdateDescription(statusJson.current.Data)
      if (statusJson.current.UnitId === unitID) {
        setUnitStatus(statusJson.current.Data.toUpperCase());
      }
    }
  };
  const updateUploading = () => {
    EvidenceAgent.getQueuedAssets(unitID).then((response: QueuedAssets[]) => setQueuedAssets(response.filter(x => x.fileState == "Uploading").length));
  }
  const singleEventListener = (function (element: any) {
    var eventListenerHandlers: any = {};
    return function (eventName: string, func?: any) {
      eventListenerHandlers.hasOwnProperty(eventName) && element.removeEventListener(eventName, eventListenerHandlers[eventName]);
      if (func) {
        eventListenerHandlers[eventName] = func;
        element.addEventListener(eventName, func);
      }
      else {
        delete eventListenerHandlers[eventName];
      }
    }
  })(window);


  const onChangeGroupInfo = (
    name: string,
    decription: string,
    groupName: string,
    configTemp: any,
    configTemplateList: any,
    stationList: any,
    stationId: any
  ) => {
    setUnitInfo({
      name: name,
      description: decription,
      groupName: groupName,
      configTemp: configTemp,
      configTemplateList: configTemplateList,
      stationList: stationList,
      stationId: stationId,
      allconfigTemplateList: allconfigTemplateList,
      lastCheckedIn: primaryDeviceInfo.lastCheckedIn
    });

  };

  const redirectPage = () => {
    var unitInfo_temp: UnitInfoModel = {
      name: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.name,
      description: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.description,
      groupName: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.triggerGroup,
      configTemp: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.configTemplateId, // none
      configTemplateList: configTemplateList,
      stationList: stationList,
      stationId: primaryDeviceInfo === undefined ? "" : stationID,
      allconfigTemplateList: allconfigTemplateList,
      lastCheckedIn: primaryDeviceInfo.lastCheckedIn
    };

    if (JSON.stringify(unitInfo) !== JSON.stringify(unitInfo_temp)) {
      setIsOpen(true);
    } else
      history.push(
        urlList.filter((item: any) => item.name === urlNames.unitsAndDevices)[0]
          .url
      );
  };

  const showSave = () => {
    let unitInfo_temp: UnitInfoModel = {
      name: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.name,
      description: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.description,
      groupName: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.triggerGroup,
      configTemp: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.configTemplateId,
      configTemplateList: primaryDeviceInfo === undefined ? [] : unitInfo.configTemplateList,
      stationList: primaryDeviceInfo === undefined ? [] : unitInfo.stationList,
      stationId: primaryDeviceInfo === undefined ? "" : stationID,
      allconfigTemplateList: allconfigTemplateList,
      lastCheckedIn: primaryDeviceInfo === undefined ? "" : primaryDeviceInfo.lastCheckedIn
    };

    if (JSON.stringify(unitInfo) !== JSON.stringify(unitInfo_temp)) {
      setIsSaveButtonDisabled(false);
    } else {
      setIsSaveButtonDisabled(true);
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    history.push(
      urlList.filter((item: any) => item.name === urlNames.unitsAndDevices)[0]
        .url
    );
  };

  const onSave = (e: React.MouseEventHandler<HTMLInputElement>) => {
    //let editCase = !isNaN(+id);
    var url = "/Stations/" + stationID + "/Units/" + unitID + "/ChangeUnitInfo";

    let unitData: UnitTemp = {
      name: unitInfo.name,
      description: unitInfo.description,
      triggerGroup: unitInfo.groupName,
      unitConfigurationTemplate: unitInfo.configTemp,
      stationId: unitInfo.stationId
    };

    UnitsAndDevicesAgent.changeUnitInfo(url, unitData).then(() => {
      setIsSaveButtonDisabled(true);
      SetStationName(unitInfo.stationList.find((y: any) => y.value == unitInfo.stationId).displayText);
      SetStationID(unitData.stationId);
      targetRef.current.showToaster({ message: t("Unit_Edited_Sucessfully"), variant: "success", duration: 5000, clearButtton: true });
    })
      .catch(function (e: any) {
        catchError(e);
      })

  };
  const catchError = (e: any) => {
    if (e.request.status == 500) {
      targetRef.current.showToaster({ message: t("We_re_sorry._The_form_was_unable_to_be_saved._Please_retry_or_contact_your_Systems_Administrator"), variant: "error", duration: 5000, clearButtton: true });
    }
    else {
      targetRef.current.showToaster({ message: e.response.data, variant: "error", duration: 5000, clearButtton: true });
    }
    return e;
  }
  const alertMsgDiv = showSuccess ? " " : "hideMessageGroup";

  const [resChecker, setresChecker] = useState(true);

  const useWindowSize = () => {
    const [size, setSize] = useState(0);

    useLayoutEffect(() => {
      const updateSize = () => {
        setSize(window.innerWidth);
      };
      window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
  };

  const size = useWindowSize();

  const toggleChecker = () => {
    setresChecker(false);
    if (resChecker === false) {
      setresChecker(true);
    }
  };
  const showToastMsg = (obj: any) => {
    toasterRef.current.showToaster({
      message: obj.message,
      variant: obj.variant,
      duration: obj.duration,
      clearButtton: true,
    });
  };

  const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([

    {
      label: `${t("Device_Name")}`,
      id: "deviceName",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      minWidth: "280"
    },
    {
      label: `${t("Device_Type")}`,
      id: "deviceType",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      minWidth: "250"
    },
    {
      label: `${t("Description")}`,
      id: "description",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      minWidth: "750"
    },
    {
      label: `${t("Status")}`,
      id: "status",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      minWidth: "280"
    },
    {
      label: `${t("Version")}`,
      id: "version",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      minWidth: "260"
    }
  ]);
  const assignUser = () => {
    setOpenAssignUser(true);
  }
  const handleCloseAssignUser = () => {
    if (IsformUpdated) setIsModalOpen(true);
    else setOpenAssignUser(false);
  }
  const clearAll = () => {
    const clearButton: any = document.getElementsByClassName(
      "MuiAutocomplete-clearIndicator"
    )[0];
    clearButton && clearButton.click();
    setOpen(false);
    // setSearchData([]);
    let headCellReset = onClearAll(headCells);
    setHeadCells(headCellReset);
  };
  const resizeRowUnitDetail = (e: { colIdx: number; deltaX: number }) => {
    let headCellReset = onResizeRow(e, headCells);
    setHeadCells(headCellReset);
  };
  const onSetHeadCells = (e: HeadCellProps[]) => {
    let headCellsArray = onSetSingleHeadCellVisibility(headCells, e);
    setHeadCells(headCellsArray);
  };
  return (
    <div className="UnitDetailMain _Unit_Detail_View">
      <CRXToaster ref={targetRef} />
      <CRXModalDialog
        maxWidth="lg"
        title={t("Assign_user(s)")}
        className={"CRXModal CRXModalAssignUser"}
        modelOpen={openAssignUser}
        onClose={() => handleCloseAssignUser}
        defaultButton={false}
        indicatesText={true}
      >
        <UnitDeviceAssignUser
          selectedItems={selectedItems}
          filterValue={filterValue}
          setFilterValue={(v: any) => setFilterValue(v)}
          filterGroupValue={filterGroupValue}
          setFilterGroupValue={(v: any) => setFilterGroupValue(v)}
          rowData={primaryDeviceInfo}
          setRemovedOption={(e: any) => { }}
          setOnClose={() => setOpenAssignUser(false)}
          showToastMsg={showToastMsg}
          setIsformUpdated={(e: boolean) => setIsformUpdated(e)}
        />
      </CRXModalDialog>
      <div className="unitDetailAction">
        <div className="menuUnitDetail">
          <Menu
            align="start"
            viewScroll="initial"
            direction="bottom"
            position="auto"
            className="menuCss"
            arrow
            menuButton={
              <MenuButton>
                <i className="fas fa-ellipsis-h"></i>
              </MenuButton>
            }
          >
            <MenuItem href={`${urlList.filter((item: any) => item.name === urlNames.singleLiveView)[0].url}&stationId=${stationID}&unitSysSerial=${unitID}&unitId=${primaryDeviceInfo ? primaryDeviceInfo.name : ""}`} target="_blank">
              <Restricted moduleId={57}>
                <div className="crx-meu-content  crx-spac">
                  <div className="crx-menu-icon">
                  </div>
                  <div className="crx-menu-list">{t("View_Live_Video")}</div>
                </div>
              </Restricted>
            </MenuItem>
            <MenuItem>
              <div className="crx-meu-content crx-spac" onClick={assignUser} >
                <div className="crx-menu-icon">
                </div>
                <div className="crx-menu-list">
                  {t("Assign_user(s)")}
                </div>
              </div>
            </MenuItem>
          </Menu>
        </div>
        <CBXLink children="Exit" onClick={() => history.goBack()} />
      </div>

      <div className="CrxUnitDetailId">
        {primaryDeviceInfo != undefined ? (
          <div className="unitDeviceDetail">
            <div className="uddDashboard">
              <div
                className={
                  resChecker === false
                    ? "MainBoard MainBoardFlow "
                    : "MainBoard"
                }
                onChange={(e) => console.log(e)}
              >
                <div
                  onClick={() => {
                    toggleChecker();
                  }}
                  className={
                    size < 1540 && resChecker === false
                      ? "arrowResponsiveLeftShow"
                      : "arrowResponsiveLeftHide"
                  }
                >
                  <i className="far fa-angle-left"></i>
                </div>
                <div className="LeftBoard">
                  <div
                    className={
                      size < 1540 && resChecker === false
                        ? "pannelBoard pannelBoardHide"
                        : "pannelBoard mr-59"
                    }
                  >
                    <div className="panel_Heading_unitDetail" id="unitDeviceType">{location?.state?.deviceTypeName?.toUpperCase()}</div>
                    <img
                      className="deviceImage"
                      src={
                        location?.state?.deviceTypeName === "BC04"
                          ? BC04
                          : location?.state?.deviceTypeName === "BC03 LTE"
                          ? BC03
                          : location?.state?.deviceTypeName === "BC02"
                          ? BC02
                          : location?.state?.deviceTypeName === "Incar"
                            ? DVRVRX20
                          //   : primaryDeviceInfo.deviceType === "MasterDock"
                          //     ? MASTERDOCK
                              : MASTERDOCK
                      }
                      alt={primaryDeviceInfo.deviceType}
                    />
                    <p>{t("PRIMARY_UNIT_DEVICE")}</p>
                  </div>
                  <div
                    className={
                      size < 1350 && resChecker === false
                        ? "pannelBoard pannelBoardHide mr-59"
                        : "pannelBoard mr-59"
                    }
                  >
                    <div className="panel_Heading_unitDetail" id="unitStatus">{unitStatus}</div>
                    <span className={`pdStatus ${unitStatus}`}>

                      <i className="fas fa-circle"></i>
                    </span>
                    <p>{t("STATUS")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail" id="unitSerialNum">{primaryDeviceInfo.serialNumber.toUpperCase()}</div>
                    <span className="noRow"></span>
                    <p>{t("SERIAL_NUMBER")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail" id="unitKey">{primaryDeviceInfo.key.toUpperCase()}</div>
                    <span className="noRow"></span>
                    <p>{t("KEY")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail" id="unitVersion">{primaryDeviceInfo.version}</div>
                    <span className="noRow"></span>
                    <p>{t("CURRENT_VERSION")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail" id="unitStationName">{stationName.toUpperCase()}</div>
                    <span className="noRow"></span>
                    <p>{t("STATION")}</p>
                  </div>

                </div>

                <div className="RightBoard">
                  <div className="pannelBoard mr-50">
                    <div className="panel_Heading_unitDetail" id="unitAssetStatus">{queuedAssets}</div>
                    <span className="pdUpload" onClick={updateUploading}>
                      <i className="fad fa-sync-alt"></i>
                    </span>
                    <p>{t("UPLOADING")}</p>
                  </div>
                  <div
                    className={
                      size < 1350 && resChecker === true
                        ? "pannelBoard pannelBoardHide mr-50"
                        : "pannelBoard mr-50"
                    }
                  >
                    <div className="panel_Heading_unitDetail" id="unitAssetCount">{assetsCount}</div>
                    <span className="noRow"></span>
                    <p>{t("ASSETS")}</p>
                  </div>
                  <div
                    className={
                      size < 1540 && resChecker === true
                        ? "pannelBoard pannelBoardHide"
                        : "pannelBoard"
                    }
                  >
                    <div className="panel_Heading_unitDetail" id="unitAssignTo">{primaryDeviceInfo.assignedTo}</div>
                    <CRXTooltip iconName="fa-solid fa-ellipsis-h" className='crxTooltipFilter' placement={"top"} arrow={false} title={primaryDeviceInfo.assignedToString}>
                      <span className="pdDotted">
                      </span>
                    </CRXTooltip>
                    <p>{t("ASSIGNED_TO")}</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    toggleChecker();
                  }}
                  className={
                    size < 1540 && resChecker === true
                      ? "arrowResponsiveShow"
                      : "arrowResponsiveHide"
                  }
                >
                  <i className="far fa-angle-right"></i>
                </div>
              </div>
            </div>
          </div>
        ) : null}



        {/* <CRXAlert
        ref={alertRef}
        message={responseError}
        className='crxAlertUserEditForm'
        alertType={alertType}
        type={errorType}
        open={alert}
        setShowSucess={() => null}
      /> */}

        <CRXTabs
          value={value}
          onChange={handleChange}
          tabitems={inCarTab === "DVR" ? tabs : tabs1}
          stickyTab={283}
        />
        <CrxTabPanel value={value} index={0}>
          <div className={showMessageError}></div>
          <UnitConfigurationInfo
            info={unitInfo}
            onChangeGroupInfo={onChangeGroupInfo}
            // validationCheckOnButton={validationCheckOnButton}
            // setButton={setButton}
            setIsSaveButtonDisabled={setIsSaveButtonDisabled}
            onSave={onSave}
            isSaveButtonDisabled={isSaveButtonDisabled}
            redirectPage={redirectPage}
            setIsOpen={setIsOpen}
            closeDialog={closeDialog}
            isOpen={isOpen}
          />

        </CrxTabPanel>


        {inCarTab === "DVR" ? (
          <CrxTabPanel value={value} index={1}>
            <div className="unit_detail_tab_events unit_Device_tabUI">
              {/* <div className="indicates-label">Table auto refreshes every 10 seconds</div> */}
              {rows && (
                <CRXDataTable
                  id={t("Unit_Details")}
                  getRowOnActionClick={(val: UnitAndDevice) =>
                    setSelectedActionRow(val)
                  }
                  showToolbar={true}
                  showCountText={false}
                  columnVisibilityBar={false}
                  showHeaderCheckAll={false}
                  initialRows={reformattedRows}
                  dragVisibility={false}
                  showCheckBoxesCol={false}
                  showActionCol={false}
                  headCells={headCells}
                  dataRows={rows}
                  orderParam={order}
                  orderByParam={orderBy}
                  searchHeader={false}
                  allowDragableToList={true}
                  showTotalSelectedText={false}
                  showActionSearchHeaderCell={true}
                  showCustomizeIcon={false}
                  className="unit_detail_tab_events_data_table"
                  onClearAll={clearAll}
                  getSelectedItems={(v: UnitAndDevice[]) => setSelectedItems(v)}
                  onResizeRow={resizeRowUnitDetail}
                  onHeadCellChange={onSetHeadCells}
                  setSelectedItems={setSelectedItems}
                  selectedItems={selectedItems}
                  offsetY={190}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setPage={(page: any) => setPage(page)}
                  setRowsPerPage={(rowsPerPage: any) => setRowsPerPage(rowsPerPage)}
                  totalRecords={rows.length}
                />
              )}
            </div>
            {/* {`station ID == ${stationID}`} <br />
            {`unit ID == ${unitID}`} <br />
            {`template name == ${inCarTab}`} */}
          </CrxTabPanel>
        ) : <CrxTabPanel value={value} index={1}>
          <QueuedAsstsDataTable unitId={unitID} setQueuedAssetsCount={setQueuedAssets} />
        </CrxTabPanel>}


        {inCarTab === "DVR" ? (
          <CrxTabPanel value={value} index={2}>
            <QueuedAsstsDataTable unitId={unitID} setQueuedAssetsCount={setQueuedAssets} />
          </CrxTabPanel>
        ) : (<CrxTabPanel value={value} index={2}>
          <UnitDeviceEvents id={unitID} />
        </CrxTabPanel>)}

        {inCarTab === "DVR" ? (
          <CrxTabPanel value={value} index={3}>
            <UnitDeviceEvents id={unitID} />
          </CrxTabPanel>
        ) : (<CrxTabPanel value={value} index={3}>
          <UnitDeviceDiagnosticLogs id={unitID} />
        </CrxTabPanel>)}



        {inCarTab === "DVR" ? (
          <CrxTabPanel value={value} index={4}>
            <UnitDeviceDiagnosticLogs id={unitID} />
          </CrxTabPanel>
        ) : null}

        <CrxTabPanel value={value} index={5}>
          <LiveDiagnostic unitName={unitInfo.name} stationId={location.state.stationId} unitId={location.state.unitId} deviceType={location.state.deviceType} />
        </CrxTabPanel>

        <div className="tab-bottom-buttons stickyFooter_Tab pd-b-50">

        </div>
      </div>
    </div >
  );
};

export default UnitCreate;
