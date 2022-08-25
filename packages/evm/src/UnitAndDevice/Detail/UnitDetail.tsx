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
import BC03 from "../../Assets/Images/BC03.png";
import DVRVRX20 from "../../Assets/Images/DVR-VR-X20.png";
import BC04 from "../../Assets/Images/BC04.png";
import MASTERDOCK from "../../Assets/Images/Master-Dock.png";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import { CRXConfirmDialog, CRXDataTable } from "@cb/shared";
import { urlList, urlNames } from "../../utils/urlList";
import "./UnitDetail.scss";
import { enterPathActionCreator } from "../../Redux/breadCrumbReducer";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import textDisplay from "../../GlobalComponents/Display/TextDisplay";
import {
  HeadCellProps,
  onResizeRow,
  Order,
  onSetSingleHeadCellVisibility,
  onClearAll,
} from "../../GlobalFunctions/globalDataTableFunctions";
import UnitAndDevicesActionMenu from "../UnitAndDevicesActionMenu";
import Cookies from 'universal-cookie';
import QueuedAsstsDataTable from "./AssetQueuedDataTable";
import { UnitsAndDevicesAgent } from "../../utils/Api/ApiAgent";
import { GetPrimaryDeviceInfo, Unit, UnitTemp, UnitTemplateConfigurationInfo } from "../../utils/Api/models/UnitModels";
import { Station } from "../../utils/Api/models/StationModels";
const cookies = new Cookies();

export type UnitInfoModel = {
  name: string;
  description: string;
  groupName: string;
  configTemp: any;
  configTemplateList: any;
  stationList: any;
  stationId: any;
};

type UnitAndDevice = {
  deviceNames:string;
  deviceTypes:string;
  deviceSerialNumbers:string;
  deviceVersions:string
 
};

type stateProps = {
  template: any;
  unitId: any;
  stationId: historyProps;
};

type locationProps = {
  state: stateProps;
};

type historyProps = {
  location: locationProps;
  stationId: string;
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
    stationId: ""
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation<string>();
  const [showSuccess,] = useState<boolean>(false);
  const [showMessageError] = useState<string>("");
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState<boolean>(true);
  const [buttonLogic, setButton] = useState<boolean>();
  const [rows, setRows] = React.useState<UnitAndDevice[]>([]);
  const [order] = React.useState<Order>("asc");
  const [orderBy] = React.useState<string>("name");
  const [open, setOpen] = React.useState<boolean>(false);
  const validationCheckOnButton = (checkError: boolean) => {setButton(checkError);};
  const [selectedActionRow, setSelectedActionRow] =React.useState<UnitAndDevice>();
  const [selectedItems, setSelectedItems] = React.useState<UnitAndDevice[]>([]);
  const [reformattedRows, setReformattedRows] = React.useState<UnitAndDevice[]>();
  const targetRef = React.useRef<typeof CRXToaster>(null);
  const alertRef = useRef(null);
  const [alertType] = useState<string>('inline');
  const [errorType] = useState<string>('error');
  const [responseError] = React.useState<string>('');
  const [alert] = React.useState<boolean>(false);


  const [stationName, SetStationName] = React.useState<string>('');

  function handleChange(event: any, newValue: number) {
    setValue(newValue);
  }



  const stationID = location.state.stationId;
  const unitID = location.state.unitId;
  const inCarTab: any = location.state.template;

  const tabs1 = [
    { label: t("Configuration"), index: 0 },
    { label: t("Queued_Assets"), index: 1 },
    { label: t("Events"), index: 2 },
    { label: t("Device_Diagnostic"), index: 3 },
    { label: t("Update_History"), index: 4 }
  ];

  const tabs = [
    { label: t("Configurations"), index: 0 },
    { label: t("Devices"), index: 1 },
    { label: t("Queued_Assets"), index: 2 }
  ];

  const [devicesList, setDevicesList] = useState<any>();
  const [stationList, setStationList] = useState<any>();
  const [configTemplateList, setConfigTemplateList] = useState<any>();
  const [primaryDeviceInfo, setPrimaryDeviceInfo] = useState<any>();

  React.useEffect(() => {
    UnitsAndDevicesAgent.getPrimaryDeviceInfo("/Stations/" + stationID + "/Units/" + unitID + "/GetPrimaryDeviceInfo").then((response:GetPrimaryDeviceInfo) => setPrimaryDeviceInfo(response));
    UnitsAndDevicesAgent.getConfigurationTemplateList("/Stations/" + stationID + "/Units/" + unitID + "/GetConfigurationTemplate").then((response:UnitTemplateConfigurationInfo[]) => setConfigTemplateList(response));
    UnitsAndDevicesAgent.getAllStationInfo("").then((response:Station[]) => setStationList(response));
    UnitsAndDevicesAgent.getUnit("/Stations/" + stationID + "/Units/" + unitID + "?Page=1&Size=100").then((response:Unit) => setDevicesList(response));
  }, []);

  React.useEffect(() => {
    let unitAndDevicesRows: UnitAndDevice[] = [];
    let deviceNames:UnitAndDevice[]=[]
  
    if (devicesList != undefined) {
      deviceNames = devicesList.name
      unitAndDevicesRows = devicesList.devices.map((data: any) => {
        return { id: data.id,deviceNames:deviceNames, deviceTypes:data.publicKey.format,deviceSerialNumbers:data.identifier,
          deviceVersions:data.version.current.major+"."+data.version.current.minor+"."+data.version.current.build+"."+data.version.current.revision
         };
      });

      setRows(unitAndDevicesRows);
    }
  }, [devicesList]);

  React.useEffect(() => {
    showSave();
  }, [unitInfo]);

  React.useEffect(() => {
    if (buttonLogic == true) setIsSaveButtonDisabled(true);

    if (buttonLogic == false) setIsSaveButtonDisabled(false);
  }, [buttonLogic]);

  React.useEffect(() => {
    if (buttonLogic == true) setIsSaveButtonDisabled(true);
  });

  React.useEffect(() => {
    if (primaryDeviceInfo !== undefined && configTemplateList !== undefined &&  stationList !== undefined) {
      SetStationName(primaryDeviceInfo.station)
      let template: any = [{ displayText: t("None"), value: "0" }];
      configTemplateList.map((x: any) => {
        template.push({ displayText: x.name, value: x.id });
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
        stationId: stationID
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
  }, [primaryDeviceInfo, configTemplateList]);

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
      stationId: stationId
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
      stationId: primaryDeviceInfo === undefined ? "" : stationID
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
      stationId: primaryDeviceInfo === undefined ? "": stationID
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
      targetRef.current.showToaster({message: t("Unit_Edited_Sucessfully"), variant: "Success", duration: 5000, clearButtton: true});
      setIsSaveButtonDisabled(true);
      SetStationName(unitInfo.stationList.find((y:any)=> y.value === unitInfo.stationId).displayText)    
    })
    .catch(function (error) {
      return error;
    })
      
  };
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
    console.log("false here");
    if (resChecker === false) {
      setresChecker(true);
      console.log("true here");
    }
  };


  const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([
  
    {
      label: `${t("Device_Name")}`,
      id: "deviceNames",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
    },
    {
      label: `${t("Device_Type")}`,
      id: "deviceTypes",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
    },
    {
      label: `${t("Serial_Number")}`,
      id: "deviceSerialNumbers",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false
    },
    {
      label: `${t("Version")}`,
      id: "deviceVersions",
      align: "right",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false
    }
  ]);
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
    <div className="UnitDetailMain switchLeftComponents _Unit_Detail_View">
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
            <MenuItem>
              <div className="crx-meu-content">
                <div className="crx-menu-icon">
                  <i className="far fa-user-tag fa-md"></i>
                </div>
                <div className="crx-menu-list">{t("test")}</div>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="crx-meu-content groupingMenu">
                <div className="crx-menu-icon"></div>
                <div className="crx-menu-list">{t("test")}</div>
              </div>
            </MenuItem>
            <MenuItem>
              <div className="crx-meu-content ">
                <div className="crx-menu-icon"></div>
                <div className="crx-menu-list">{t("test")}</div>
              </div>
            </MenuItem>
          </Menu>
        </div>
        <div className="unitExit">
          <p onClick={history.goBack}>{t("Exit")}</p>
        </div>
      </div>

      <div className="crxTabsPermission CrxUnitDetailId">
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
                    <div className="panel_Heading_unitDetail">{primaryDeviceInfo.deviceType.toUpperCase()}</div>
                    <img
                      className="deviceImage"
                      src={
                        primaryDeviceInfo.deviceType === "BC03"
                          ? BC03
                          : primaryDeviceInfo.deviceType === "BC04"
                          ? BC04
                          : primaryDeviceInfo.deviceType === "MasterDock"
                          ? MASTERDOCK
                          : DVRVRX20
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
                    <div className="panel_Heading_unitDetail">{t(primaryDeviceInfo.status.toUpperCase())}</div>
                    <span className={`pdStatus ${primaryDeviceInfo.status}`}>
                      <i className="fas fa-circle"></i>
                    </span>
                    <p>{t("STATUS")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail">{primaryDeviceInfo.serialNumber.toUpperCase()}</div>
                    <span className="noRow"></span>
                    <p>{t("SERIAL_NUMBER")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail">{primaryDeviceInfo.version}</div>
                    <span className="noRow"></span>
                    <p>{t("CURRENT_VERSION")}</p>
                  </div>
                  <div className="pannelBoard mr-59">
                    <div className="panel_Heading_unitDetail">#01</div>
                    <span className="noRow"></span>
                    <p>{t("STATION")}</p>
                  </div>
                  
                </div>

                <div className="RightBoard">
                  <div className="pannelBoard mr-50">
                    <div className="panel_Heading_unitDetail">0</div>
                    <span className="pdUpload">
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
                    <div className="panel_Heading_unitDetail">0</div>
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
                    <div className="panel_Heading_unitDetail">{primaryDeviceInfo.assignedTo}</div>
                    <span className="pdDotted">
                      <i className="fas fa-ellipsis-h"></i>
                    </span>
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
          tabitems={inCarTab === "Incar" ? tabs : tabs1}
        />
        <CrxTabPanel value={value} index={0}>
          <div className={showMessageError}>
            <UnitConfigurationInfo
              info={unitInfo}
              onChangeGroupInfo={onChangeGroupInfo}
              validationCheckOnButton={validationCheckOnButton}
            />
          </div>
        </CrxTabPanel>

        {inCarTab === "Incar" ? (
          <CrxTabPanel value={value} index={1}>
            <div className="unitDeviceMain searchComponents unitDeviceMainUii">
              {rows && (
                <CRXDataTable
                  id={t("Unit_Details")}
                  getRowOnActionClick={(val: UnitAndDevice) =>
                    setSelectedActionRow(val)
                  }
                  showToolbar={true}
                  showCountText={true}
                  columnVisibilityBar={true}
                  showHeaderCheckAll={false}
                  initialRows={reformattedRows}
                  dragVisibility={false}
                  showCheckBoxesCol={false}
                  showActionCol={false}
                  headCells={headCells}
                  dataRows={rows}
                  orderParam={order}
                  orderByParam={orderBy}
                  searchHeader={true}
                  allowDragableToList={true}
                  showTotalSelectedText={false}
                  showActionSearchHeaderCell={true}
                  showCustomizeIcon={true}


                  className=""
                  onClearAll={clearAll}
                  getSelectedItems={(v: UnitAndDevice[]) => setSelectedItems(v)}
                  onResizeRow={resizeRowUnitDetail}
                  onHeadCellChange={onSetHeadCells}
                  setSelectedItems={setSelectedItems}
                  selectedItems={selectedItems}
                  offsetY={190}
                />
              )}
            </div>
            {/* {`station ID == ${stationID}`} <br />
            {`unit ID == ${unitID}`} <br />
            {`template name == ${inCarTab}`} */}
          </CrxTabPanel>
        ) : null}

      {inCarTab === "Incar" ? (
        <CrxTabPanel value={value} index={2}>    
          <QueuedAsstsDataTable/>       
        </CrxTabPanel>
          ) : null}

        <CrxTabPanel value={value} index={1}>    
          <QueuedAsstsDataTable/>       
        </CrxTabPanel>


        <div className="tab-bottom-buttons">
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
                    (item: any) => item.name === urlNames.unitsAndDevices
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
          primary="Yes, close"
          secondary="No, do not close"
          text="unit configuration form"
        >
          <div className="confirmMessage">
          {t("You_are_attempting_to")} <strong>{t("close")}</strong> {t("the")}{" "}
            <strong>{t("'unit_configuration_form'")}</strong>. {t("If_you_close_the_form")},
            {t("any_changes_you_ve_made_will_not_be_saved.")} 
            {t("You_will_not_be_able_to_undo_this_action.")}
            <div className="confirmMessageBottom">
            {t("Are_you_sure_you_would_like_to")} <strong>{t("close")}</strong> {t("the_form?")}
            </div>
          </div>
        </CRXConfirmDialog>
      </div>
    </div>
  );
};

export default UnitCreate;
