import { CRXDataTable } from "@cb/shared";
import {
    SearchObject,
    ValueString,
    HeadCellProps,
    onSetSearchDataValue,
    RemoveSidePanelClass,
    PageiGrid,
    GridFilter,
    onResizeRow,
    Order,
    onClearAll,
    onSetSingleHeadCellVisibility,
} from "../../../../GlobalFunctions/globalDataTableFunctions";
import React, { useEffect } from "react";
import textDisplay from "../../../../GlobalComponents/Display/TextDisplay";
import { AlprCapturePlateInfo } from "../../../../utils/Api/models/AlprCapturePlateInfo";
import TextSearch from "../../../../GlobalComponents/DataTableSearch/TextSearch";
import { useTranslation } from "react-i18next";
import "./AlprCapture.scss"
import { CRXMultiSelectBoxLight } from "@cb/shared";
import { DateTimeComponent } from "../../../../GlobalComponents/DateTime";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../Redux/rootReducer";
import { getUsersInfoAsync } from "../../../../Redux/UserReducer";
import { getAllAlprCapturePlatesInfo } from "../../../../Redux/AlprCapturePlateReducer";
import moment from "moment";
import { basicDateDefaultValue, dateOptionsTypes } from "../../../../utils/constant";
import { GetAlprCapturePayload } from "../../ALPRTypes";
import { CRXColumn } from "@cb/shared";
import multitextDisplay from "../../../../GlobalComponents/Display/MultiTextDisplay";
import { CBXMultiCheckBoxDataFilter } from "@cb/shared";
import { CBXMultiSelectForDatatable } from "@cb/shared";
import { ClickAwayListener } from "@material-ui/core";
import { GetAllHotListData } from "../../../../Redux/AlprHotListReducer";
import { getToken } from "../../../../Login/API/auth";
import jwt_decode from "jwt-decode";
import NumberSearch from "../../../../GlobalComponents/DataTableSearch/NumberSearch";
import { urlList, urlNames } from "../../../../utils/urlList";
import AnchorDisplay from "../../../../utils/AnchorDisplay";
import { states } from "../../GlobalDropdown";
import { AlprGlobalConstants, gridAlignment, nullValidationHandling } from "../../AlprGlobal";
import { dateDisplayFormat } from "../../../../GlobalFunctions/DateFormat";



const AlprCapture = () => {
    const [capturedPlatesRows, setCapturedPlatesRowsState] = React.useState<AlprCapturePlateInfo[]>([]);
    const [reformattedRows, setReformattedRows] = React.useState<any>();
    const dispatch = useDispatch();
    const userInfos:any = useSelector((state:RootState) => state.userReducer.usersInfo)
    const hotListInfos:any = useSelector((state:RootState) => state.hotListReducer.HotList)
    const capturedPlates:any = useSelector((state:RootState)=> state.alprCapturePlateReducer.capturePlateInfos)
    const [usersData, setUsersDataState] = React.useState<any[]>([]);
    const [hotListData, setHotListDataState] = React.useState<any[]>([]);
    const [usersFilterData, setUsersFilterDataState] = React.useState<any[]>([]);
    const [selectedUser, setSelectedUserState] = React.useState<any>({});
    const [selectedHotList, setSelectedHotListState] = React.useState<any>({});
    const [selectedDateTimeRange, setSelectedDateTimeRangeState] = React.useState<DateTimeObject>({
        startDate: moment().startOf("day").subtract(10000, "days").set("second", 0).format(),
        endDate: moment().endOf("day").set("second", 0).format(),
        value: basicDateDefaultValue,
        displayText: basicDateDefaultValue
      });

    const [selectedDateTimeRangeForFilter, setSelectedDateTimeRangeStateForFilter] = React.useState<DateTimeObject>({
        startDate: moment().startOf("day").subtract(10000, "days").set("second", 0).format(),
        endDate: moment().endOf("day").set("second", 0).format(),
        value: basicDateDefaultValue,
        displayText: basicDateDefaultValue
    });

    const userDataLoadedRef = React.useRef<boolean>(false);
    const hotListDataLoadedRef = React.useRef<boolean>(false);
    const isSearchable = React.useRef<boolean>(false);
    const isSearchableOnChange = React.useRef<boolean>(false);

    const [searchData, setSearchData] = React.useState<SearchObject[]>([]);
    const { t } = useTranslation<string>();
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<string>("NumberPlate");
    const [selectedItems, setSelectedItems] = React.useState<AlprCapturePlateInfo[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(AlprGlobalConstants.DEFAULT_GRID_PAGE_SIZE);
    const [page, setPage] = React.useState<number>(0);
    const [getAlprCapturePayload, setAlprCapturePayloadState] = React.useState<GetAlprCapturePayload>({
        pageiGrid:{
            gridFilter: {
                logic: "and",
                filters: []
            },
            page: AlprGlobalConstants.DEFAULT_GRID_INITIAL_PAGE,
            size: AlprGlobalConstants.DEFAULT_GRID_PAGE_SIZE,
            gridSort:{
                field: orderBy,
                 dir:order
                }
        },
        userId:selectedUser.id,
        startDate: moment(selectedDateTimeRange.startDate).toISOString(),
        endDate: moment(selectedDateTimeRange.endDate).toISOString(),
        hotListId:0
      })
    
    const USER_COLID:number = 6;
    const HOTLIST_COLID:number = 3;
    const STATES_COLID:number = 8;


    type DateTimeProps = {
        dateTimeObj: DateTimeObject;
        colIdx: number;
      };
    type DateTimeObject = {
        startDate: string;
        endDate: string;
        value: string;
        displayText: string;
      };
      let dateTimeObject: DateTimeProps = {
        dateTimeObj: {
          startDate: "",
          endDate: "",
          value: "",
          displayText: "",
        },
        colIdx: 0,
      };
  
    const onSetHeadCells = (e: HeadCellProps[]) => {
        let headCellsArray = onSetSingleHeadCellVisibility(headCells, e);
        setHeadCells(headCellsArray);

    };
    const resizeRowCaptureTemp = (e: { colIdx: number; deltaX: number }) => {
        let headCellReset = onResizeRow(e, headCells);
        setHeadCells(headCellReset);
    };
    const onSelection = (v: ValueString[], colIdx: number) => {
        if (v.length > 0) {
            for (let i = 0; i < v.length; i++) {
                let searchDataValue = onSetSearchDataValue(v, headCells, colIdx);

                setSearchData((prevArr) => prevArr.filter((e) => e.columnName !== headCells[colIdx].id.toString()));              
                
                setSearchData((prevArr) => [...prevArr, searchDataValue]);
            }
        } else {
            setSearchData((prevArr) => prevArr.filter((e) => e.columnName !== headCells[colIdx].id.toString()));
        }
    }

    const onSelectedIndividualClear = (headCells: HeadCellProps[], colIdx: number) => {
        let headCellReset = headCells.map((headCell: HeadCellProps, index: number) => {
          if (colIdx === index)
            headCell.headerArray = [{ value: "" }];
          return headCell;
        });
        return headCellReset;
      };
    
      const onSelectedClear = (colIdx: number) => {
        isSearchableOnChange.current=true;
        setSearchData((prevArr) => prevArr.filter((e) => e.columnName !== headCells[colIdx].id.toString()));
        let headCellReset = onSelectedIndividualClear(headCells, colIdx);
        setHeadCells(headCellReset);
      }

      const clearAll = () => {
        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            pageiGrid:{
                ...getAlprCapturePayload.pageiGrid,
                gridFilter:{
                    ...getAlprCapturePayload.pageiGrid.gridFilter,
                    filters:[]
                }
            }
        })
        setSearchData([]);
        let headCellReset = onClearAll(headCells);
        setHeadCells(headCellReset);
      };

    const userIdPreset = () =>{
        var token = getToken();
        if (token) {
            var accessTokenDecode: any = jwt_decode(token);
            return accessTokenDecode.LoginId
        }
        else
         return ""
      }
    
  const searchDate = (
    rowsParam: AlprCapturePlateInfo[],
    headCells: HeadCellProps[],
    colIdx: number
  ) => {
    let reset: boolean = false;

    let dateTimeObject: DateTimeProps = {
      dateTimeObj: {
        startDate: "",
        endDate: "",
        value: "",
        displayText: "",
      },
      colIdx: 0,
    };

    if (
      headCells[colIdx].headerObject !== null ||
      headCells[colIdx].headerObject === undefined
    )
      reset = false;
    else reset = true;

    if (
      headCells[colIdx].headerObject === undefined ||
      headCells[colIdx].headerObject === null
    ) {
        const minCapturedDate = reformattedRows && reformattedRows.rowsDataItems ? reformattedRows.rowsDataItems.reduce((item1:AlprCapturePlateInfo, item2:AlprCapturePlateInfo) => {
            return (Date.parse(item1.capturedAt)) < (Date.parse(item2.capturedAt)) ? item1 : item2;
          }).capturedAt : "";

          const maxCapturedDate = reformattedRows && reformattedRows.rowsDataItems ? reformattedRows.rowsDataItems.reduce((item1:AlprCapturePlateInfo, item2:AlprCapturePlateInfo) => {
            return (Date.parse(item1.capturedAt)) > (Date.parse(item2.capturedAt)) ? item1 : item2;
          }).capturedAt : "";

      dateTimeObject = {
        dateTimeObj: {
          startDate: minCapturedDate,
          endDate:maxCapturedDate,
          value: "custom",
          displayText: t("custom_range"),
        },
        colIdx: 0,
      };
    } else {
      dateTimeObject = {
        dateTimeObj: {
          ...headCells[colIdx].headerObject,
        },
        colIdx: 0,
      };
    } 

    return (
      <CRXColumn item xs={11} >
        <DateTimeComponent
          showCompact={false}
          reset={reset}
          dateTimeDetail={dateTimeObject.dateTimeObj}
          getDateTimeDropDown={(dateTime: DateTimeObject) => {
            dateTimeObject = {
                dateTimeObj: {
                  ...dateTime,
                },
                colIdx: colIdx,
              };
              setSelectedDateTimeRangeStateForFilter(dateTime);
              headCells[colIdx].headerObject = dateTime;
          }}
          dateOptionType={dateOptionsTypes.basicoptions}
        />
      </CRXColumn>
    );
  };

  const searchAndNonSearchMultiDropDown = (
    rowsParam: AlprCapturePlateInfo[],
    headCells: HeadCellProps[],
    colIdx: number,
    initialRows: any,
    isSearchable: boolean
  ) => {

    if(colIdx === USER_COLID && initialRows && initialRows.usersData && initialRows.usersData.length > 0){
        let users: {id: number, value: string }[] = [];
        initialRows.usersData.map((x: any) => {
            let userRows = initialRows.rowsDataItems.filter((row: { user: any; })=>row.user == x.id);
            
            if(userRows && userRows.length > 0)
                users.push({id : x.id, value: x.label });
        });

        return (
            <CBXMultiCheckBoxDataFilter 
            width = {100} 
            option={users} 
            //defaultValue={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
            value={nullValidationHandling(headCells[colIdx].headerObject) ? headCells[colIdx].headerArray?.filter((v:any) => v.value !== "") : []}
            onChange={(value : any) => { 
                isSearchableOnChange.current = true;               
                onSelection(value.map((user: { id: any; })=>{return {id: user.id, value: user.id}}), colIdx);
                headCells[colIdx].headerArray = value;
            }}
            onSelectedClear = {() =>  onSelectedClear(colIdx)}
            isCheckBox={true}
            multiple={true}
            isduplicate={true}
            selectAllLabel="All"
            percentage={true}
          />);
    }
       
    if(colIdx === HOTLIST_COLID && initialRows && initialRows.hotListData && initialRows.hotListData.length > 0){
        let hotlists: {id: number, value: string }[] = [];
        initialRows.hotListData.map((x: any) => {
            if(x.id != 0)
                hotlists.push({id : x.id, value: x.label });
        });

        return (            
            <CBXMultiCheckBoxDataFilter 
            width = {100} 
            option={hotlists} 
            //defaultValue={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
            value={nullValidationHandling(headCells[colIdx].headerObject) ? headCells[colIdx].headerArray?.filter((v:any) => v.value !== "") : []}
            onChange={(value : any) => {     
                if(!isSearchableOnChange.current){
                    isSearchableOnChange.current = true;          
                    onSelection(value.map((hotlist: { id: any; value:any})=>{return {id: hotlist.id, value: hotlist.value}}), colIdx);
                    headCells[colIdx].headerArray = value;
                } 
            }}
            onSelectedClear = {(value : any) => { 
                onSelectedClear(colIdx);
            }}
            isCheckBox={true}
            multiple={true}
            isduplicate={true}
            selectAllLabel="All"
            percentage={true}
          />);
    } 

    if(colIdx === STATES_COLID && initialRows && initialRows.states && initialRows.states.length > 0){
        let statesList: {id: number, value: string }[] = [];
        initialRows.states.map((x: any) => {
            statesList.push({id : x.id, value: x.label });
        });

        return (            
            <CBXMultiCheckBoxDataFilter 
            width = {100} 
            option={statesList} 
            //defaultValue={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
            value={nullValidationHandling(headCells[colIdx].headerObject) ? headCells[colIdx].headerArray?.filter((v:any) => v.value !== "") : []}
            onChange={(value : any) => {     
                if(!isSearchableOnChange.current){
                    isSearchableOnChange.current = true;          
                    onSelection(value.map((state: { id: any; value:any})=>{return {id: state.id, value: state.value}}), colIdx);
                    headCells[colIdx].headerArray = value;
                } 
            }}
            onSelectedClear = {(value : any) => { 
                onSelectedClear(colIdx);
            }}
            isCheckBox={true}
            multiple={true}
            isduplicate={true}
            selectAllLabel="All"
            percentage={true}
          />);
    } 
  };

  const searchNumber = (
    rowsParam: AlprCapturePlateInfo[],
    headCells: HeadCellProps[],
    colIdx: number
  ) => {

    const onChange = (valuesObject: ValueString[]) => {
      headCells[colIdx].headerArray = valuesObject;
      onSelection(valuesObject, colIdx);
    };

    return (
      <NumberSearch headCells={headCells} colIdx={colIdx} onChange={onChange} />
    );
  };
  
  const searchText = (rowsParam: AlprCapturePlateInfo[], headCell: HeadCellProps[], colIdx: number) => {
    const onChange = (valuesObject: ValueString[]) => {
        headCells[colIdx].headerArray = valuesObject;
        onSelection(valuesObject, colIdx);
    }
    return (
        <TextSearch headCells={headCell} colIdx={colIdx} onChange={onChange} />
    );
  };

    const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([
        {
            label: t("ID"),
            id: "capturedPlateId",
            align: gridAlignment("number"),
            dataComponent: () => null,
            sort: false,
            searchFilter: false,
            searchComponent: searchText,
            keyCol: true,
            visible: false,
            minWidth: "150",
            attributeName: "capturedPlateId",
            attributeType: "number"
        },
        {
            label: `${t("Plate")}`,
            id: "numberPlateWithId",
            align: gridAlignment("string"),
            dataComponent: (e: string) => AnchorDisplay(e, 'linkColor', urlList.filter((item: any) => item.name === urlNames.LicensePlateHistory)[0].url),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "190",
            attributeName: "numberPlate",
            attributeType: "string",
            attributeOperator: "contains",
            visible: true
        },
        {
            label: `${t("Description")}`,
            id: "description",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "180",
            attributeName: "description",
            attributeType: "String",
            attributeOperator: "contains",
            visible: true
        },
        {
            label: `${t("Hot_List")}`,
            id: "hotlistName",
            align: gridAlignment("list"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            //   searchComponent: (rowParam: HotListCaptureTemplate[], columns: HeadCellProps[], colIdx: number, initialRow: any) => multiSelectCheckbox(rowParam, columns, colIdx, initialRow),
            searchComponent: searchAndNonSearchMultiDropDown,
            minWidth: "180",
            attributeName: "HotlistName",
            attributeType: "List",
            attributeOperator: "contains",
            visible: true
        },
        {
            label: `${t("Captured")}`,
            id: "capturedAt",
            align: gridAlignment("date"),
            dataComponent: dateDisplayFormat,
            sort: true,
            searchFilter: true,
            searchComponent: searchDate,
            minWidth: "220",
            attributeName: "CapturedAt",
            attributeType: "DateTime",
            attributeOperator: "between",
            visible: true
        },
        {
            label: `${t("Unit")}`,
            id: "unitId",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            //   searchComponent: (rowParam: HotListCaptureTemplate[], columns: HeadCellProps[], colIdx: number, initialRow: any) => multiSelectCheckbox(rowParam, columns, colIdx, initialRow),
            searchComponent: searchText,
            minWidth: "180",
            attributeName: "UnitId",
            attributeType: "String",
            attributeOperator: "contains",
            visible: true
        },
        {
            label: `${t("User")}`,
            id: "user",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: false,
            searchFilter: true,
            searchComponent: searchAndNonSearchMultiDropDown,
            minWidth: "180",
            attributeName: "UserId",
            attributeType: "List",
            attributeOperator: "contains",
            visible: true
        },
        {
            label: `${t("Confidence")}`,
            id: "confidence",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchNumber,
            minWidth: "150",
            attributeName: "Confidence",
            attributeType: "int",
            attributeOperator: "eq",
            visible: true
        }
        ,
        {
            label: `${t("State")}`,
            id: "stateName",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchAndNonSearchMultiDropDown,
            minWidth: "180",
            attributeName: "StateName",
            attributeType: "List",
            attributeOperator: "contains",
            visible: true
        }
        ,
        {
            label: `${t("Notes")}`,
            id: "notes",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "180",
            attributeName: "notes",
            attributeType: "String",
            attributeOperator: "contains",
            visible: true
        }
        ,
        {
            label: `${t("Ticket_No")}`,
            id: "ticketNumber",
            align: gridAlignment("double"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchNumber,
            minWidth: "180",
            attributeName: "TicketNumber",
            attributeType: "double",
            attributeOperator: "eq",
            visible: true
        }
        ,
        {
            label: `${t("Latitude")}`,
            id: "latitude",
            align: gridAlignment("double"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchNumber,
            minWidth: "180",
            attributeName: "Latitude",
            attributeType: "double",
            attributeOperator: "eq",
            visible: true
        }
        ,
        {
            label: `${t("Longitude")}`,
            id: "longitude",
            align:gridAlignment("double"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: true,
            searchFilter: true,
            searchComponent: searchNumber,
            minWidth: "180",
            attributeName: "Longitude",
            attributeType: "double",
            attributeOperator: "eq",
            visible: true
        }
        ,
        {
            label: `${t("Life_Span")}`,
            id: "lifeSpan",
            align: gridAlignment("string"),
            dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText", "top"),
            sort: false,
            searchFilter: false,
            searchComponent: searchText,
            minWidth: "180",
            attributeName: "lifeSpan",
            attributeType: "String",
            attributeOperator: "contains",
            visible: true
        }
    ]);
   
    useEffect(()=>{
        let pageiGrid:PageiGrid = {
            gridFilter: {
                logic: "and",
                filters: []
            },
            page: AlprGlobalConstants.DEFAULT_GRID_INITIAL_PAGE,
            size: AlprGlobalConstants.DROPDOWN_PAGE_SIZE,
        }
        dispatch(getUsersInfoAsync(pageiGrid))
    },[]);

    useEffect(()=>{
        let pageiGrid:PageiGrid = {
            gridFilter: {
                logic: "and",
                filters: []
            },
            page: AlprGlobalConstants.DEFAULT_GRID_INITIAL_PAGE,
            size: AlprGlobalConstants.DROPDOWN_PAGE_SIZE,
            gridSort:{
                field: "name",
                 dir: "asc"
                }
        }
        dispatch(GetAllHotListData(pageiGrid))
    },[]);

    const setUserData=()=>{
        if(userInfos && userInfos.data){
            let usersDataSource = userInfos.data.map((user:any)=>{
                return {
                    label: user.fName + " " + user.lName,
                    id: user.recId,
                    inputValue:user.fName + " " + user.lName
                }
            });
            
            usersDataSource = [{
                id: 0,
                label: "All"
            }, ...usersDataSource]

            setUsersDataState(usersDataSource);
            userDataLoadedRef.current =true;

            setUsersFilterDataState(userInfos.data.map((user:any)=>{
                return {
                    value: user.fName + " " + user.lName,
                    id: user.recId
                }
            }));

            setSelectedUserState(usersDataSource[0]);
        }        
    }

    const setHotListData=()=>{
        if(hotListInfos && hotListInfos.data){
            let hotListDataSource = hotListInfos.data.map((hotList:any)=>{
                return {
                    label: hotList.name,
                    id: hotList.recId,
                    inputValue:hotList.name
                }
            });
            
            hotListDataSource = [{
                id: 0,
                label: "All"
            }, ...hotListDataSource]

            setHotListDataState(hotListDataSource);
            
            hotListDataLoadedRef.current = true;
            /* setUsersFilterDataState(userInfos.data.map((user:any)=>{
                return {
                    value: user.fName + " " + user.lName,
                    id: user.recId
                }
            })); */

            setSelectedHotListState(hotListDataSource[0]);
        }        
    }

    const setCapturedPlatesRows = () => {
        if(capturedPlates && capturedPlates.data){
            let capturedPlatesRowItems = capturedPlates.data.map((capturedPlate:any)=>{
                const user = userInfos.data.filter((user:any)=>user.recId == capturedPlate.user);
                const userName = user.length > 0 ? user[0].fName + " " + user[0].lName : capturedPlate.user

                return {
                    ...capturedPlate,
                    numberPlateWithId: capturedPlate.numberPlate + "_" + capturedPlate.numberPlateId,
                    user: userName,
                    /* capturedAt: moment(capturedPlate.capturedAt).toLocaleString() */
                }
            });

            setCapturedPlatesRowsState(capturedPlatesRowItems);
            setReformattedRows({...reformattedRows, rowsDataItems: capturedPlates.data, usersData: usersData, hotListData: hotListData, states:states});
        }
    }

    const handleKeyDown = (event:any) => {
        if (event.key === 'Enter') {
            getCapturedPlateFilteredData()
        }
      }
      
      const handleBlur = () => {
        if(isSearchable.current) {     
            getCapturedPlateFilteredData()
        }
      }

    const getCapturedPlateFilteredData =()=>{
        const filters:GridFilter[] = []

        searchData.filter(x => x.value[0] !== '').forEach((item:any, index:number) => {
            let x: GridFilter = {
              operator: headCells[item.colIdx].attributeOperator,
              field: headCells[item.colIdx].attributeName,
              value: item.value.length > 1 ? item.value.join('@') : item.value[0],
              fieldType: headCells[item.colIdx].attributeType,
            }
            filters.push(x)
        })

        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            pageiGrid:{
                ...getAlprCapturePayload.pageiGrid,
                gridFilter:{
                    ...getAlprCapturePayload.pageiGrid.gridFilter,
                    filters:filters
                }
            }
        })

        isSearchable.current = false;
    }

    useEffect(()=>{
        setUserData();
    },[userInfos?.data]);

    useEffect(()=>{
        setHotListData();
    },[hotListInfos?.data]);

    useEffect(()=>{        
        if(userDataLoadedRef.current && hotListDataLoadedRef.current){
            setAlprCapturePayloadState({
                ...getAlprCapturePayload,
                userId: selectedUser.id,
                hotListId:selectedHotList.id
            })
        }
    },[selectedUser, selectedHotList]);
    
    useEffect(()=>{
        
        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            startDate:moment(selectedDateTimeRange.startDate).toISOString(),
            endDate: moment(selectedDateTimeRange.endDate).toISOString()
        })
    },[selectedDateTimeRange]);

    useEffect(()=>{
        
        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            startDate:moment(selectedDateTimeRangeForFilter.startDate).toISOString(),
            endDate: moment(selectedDateTimeRangeForFilter.endDate).toISOString()
        })
    },[selectedDateTimeRangeForFilter]);

    useEffect(()=>{
        if(typeof getAlprCapturePayload.userId != "undefined")
        {
            dispatch(getAllAlprCapturePlatesInfo(getAlprCapturePayload))
        }
    },[getAlprCapturePayload])

    useEffect(()=>{
        setCapturedPlatesRows();
    },[capturedPlates])

    useEffect(()=>{
        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            pageiGrid:{
                ...getAlprCapturePayload.pageiGrid,
                page: page,
                size:rowsPerPage
            }
        })
    }, [page, rowsPerPage])
    
    useEffect(()=>{
        setAlprCapturePayloadState({
            ...getAlprCapturePayload,
            pageiGrid:{
                ...getAlprCapturePayload.pageiGrid,
                gridSort: {
                    field: orderBy,
                    dir: order
                }
            }
        })
    },[order, orderBy]);

    useEffect(()=>{
        if(searchData && searchData.length > 0){
            isSearchable.current = true;
        }

        if(isSearchableOnChange.current){
            isSearchableOnChange.current = false; 
            getCapturedPlateFilteredData();
        }

    },[searchData])

    return (
        <ClickAwayListener onClickAway={handleBlur}>
        {/* <div className="userDataTableParent  groupPermissionInnerPage" onKeyDown={handleKeyDown}> */}
        <div className="captureDataTableParent captureInnerPage" onKeyDown={handleKeyDown}>
            <div className="ui">
                <div className="ui">
                    <label>Users:</label>
                    <CRXMultiSelectBoxLight

                        className="dropDownWidth"
                        label=""
                        // onChange={(e: any) => setFieldValue("sourceName", e.target.value)}
                        multiple={false}
                        CheckBox={false}
                        options={usersData}
                        required={false}
                        isSearchable={true}
                        value = {selectedUser}
                        // value={values.sourceName === 0 ? "" : { id: values.sourceName, label: SourceOptions.find((x: any) => x.id === values.sourceName)?.label }}

                        onChange={(
                            e: React.SyntheticEvent,
                            value: any
                        ) => {
                            // setFieldValue("sourceName", value === null ? -1 : Number.parseInt(value?.id))
                            if(value)
                                setSelectedUserState(value);
                        }
                        }
                        onOpen={(e: any) => {
                        }}
                    />
                </div>
                <div className="ui">
                    <label>{t('Hot_List')}:</label>
                    <CRXMultiSelectBoxLight

                        className="dropDownWidth"
                        label=""
                        // onChange={(e: any) => setFieldValue("sourceName", e.target.value)}
                        multiple={false}
                        CheckBox={true}
                        options={hotListData}
                        required={false}
                        isSearchable={true}
                        value={selectedHotList}

                        onChange={(
                            e: React.SyntheticEvent,
                            value: any
                        ) => {
                            if(value)
                                setSelectedHotListState(value);
                        }
                        }
                        onOpen={(e: any) => {
                        }}
                    />
                </div>
                <div className="ui">
                    <label>{t('Custom_Range')}:</label>
                    <DateTimeComponent
                        showCompact={false}
                        reset={false}
                        dateTimeDetail={selectedDateTimeRange}
                        getDateTimeDropDown={(dateTime: DateTimeObject) => {
                            setSelectedDateTimeRangeState(dateTime);
                            setSelectedDateTimeRangeStateForFilter(dateTime);
                        }}
                        dateOptionType={dateOptionsTypes.basicoptions}
                    />
                </div>
            </div>
            {capturedPlatesRows && (
                <CRXDataTable
                    id="CaptureDataTable"
                    actionComponent={() => { }} 
                    getRowOnActionClick={() => { }}
                    showToolbar={true}
                    dataRows={capturedPlatesRows}
                    initialRows={reformattedRows}
                    headCells={headCells}
                    orderParam={order}
                    orderByParam={orderBy}
                    searchHeader={true}
                    columnVisibilityBar={true}
                    allowDragableToList={true}
                    className="captureDataTable usersGroupDataTable"
                    onClearAll={clearAll}
                    getSelectedItems={(v: AlprCapturePlateInfo[]) => setSelectedItems(v)}
                    onResizeRow={resizeRowCaptureTemp}
                    onHeadCellChange={onSetHeadCells}
                    setSelectedItems={setSelectedItems}
                    selectedItems={selectedItems}
                    dragVisibility={false}
                    showCheckBoxesCol={true}
                    showActionCol={false}
                    showActionSearchHeaderCell={false}
                    showCountText={false}
                    showCustomizeIcon={true}
                    showTotalSelectedText={false}
                    lightMode={false}
                    //Please dont miss this block.
                    offsetY={129}
                    stickyToolbar={0}
                    //End here
                    page={page}
                    rowsPerPage={rowsPerPage}
                    setPage={(page: any) => setPage(page)}
                    setRowsPerPage={(rowsPerPage: any) => setRowsPerPage(rowsPerPage)}
                    totalRecords={capturedPlates.totalCount}
                    setSortOrder={(sort: any) => {
                        setOrder(sort.order)
                        setOrderBy(sort.orderBy)
                    }}
                />
            )
            }
        </div>
        </ClickAwayListener >
    )
}


export default AlprCapture;