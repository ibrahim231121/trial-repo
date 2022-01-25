import React, { useEffect } from "react";
import { CRXDataTable } from "@cb/shared";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGroupAsync, getGroupUserCountAsync } from "../../../../Redux/GroupReducer";
import textDisplay from "../../../../components/DateDisplayComponent/TextDisplay";
import anchorDisplay from "../../../../components/DateDisplayComponent/AnchorDisplay";
import { RootState } from "../../../../Redux/rootReducer";
import './ConfigurationTemplate.scss'
import { CRXButton } from "@cb/shared";
import {  Menu, MenuButton , MenuItem } from "@szhsin/react-menu";
import ConfigTemplateActionMenu from "./ConfigTemplateActionMenu";
import TextSearch from "../../../../components/SearchComponents/TextSearch";
import { getConfigurationInfoAsync } from "../../../../Redux/TemplateConfiguration";
import { Link } from "react-router-dom";
import {
    SearchObject,
    ValueString,
    HeadCellProps,
    onResizeRow,
    Order,
    onTextCompare,
    onMultiToMultiCompare,
    onSetSingleHeadCellVisibility,
    onSetSearchDataValue,
    onClearAll,
    onSetHeadCellVisibility,
    onSaveHeadCellData
  } from "../../../../utils/globalDataTableFunctions";


type ConfigTemplate = {
    id: number;
    name: string;
    type: string;
    indicator: string
  }

  const configTemplate = (name: string, id: number) => {
    return (
      <>
      <Link className={"linkColor"} children = {name} key={id}  to={{pathname:'/admin/unitanddevices/edittemplate/BC04',state:{id: id, name: name, isedit: true, type:"BC04"}}}/>
      </>
    );
  };

const ConfigurationTemplates: React.FC = () => {
    const { t } = useTranslation<string>();
    const dispatch = useDispatch();
    let history = useHistory()


    React.useEffect(() => {
      dispatch(getConfigurationInfoAsync());
  
     let headCellsArray = onSetHeadCellVisibility(headCells);
     setHeadCells(headCellsArray);
     onSaveHeadCellData(headCells, "unitConfifTemplateDataTable");  // will check this
  
    }, []);
  


    const UnitConfigurationTemplates: any = useSelector((state: RootState) => state.templateSlice.templateInfo);
    //const configTemplatCount: any = useSelector((state: RootState) => state.groupReducer.groupUserCounts);
    const [rows, setRows] = React.useState<ConfigTemplate[]>([]);
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<string>("recordingStarted");
    const [searchData, setSearchData] = React.useState<SearchObject[]>([]);
    const [selectedItems, setSelectedItems] = React.useState<ConfigTemplate[]>([]);
    const [reformattedRows, setReformattedRows] = React.useState<ConfigTemplate[]>();
    const [selectedActionRow, setSelectedActionRow] = React.useState<ConfigTemplate>();
    const setData = () => {

      let configTemplateRows: ConfigTemplate[] = [];
      if (UnitConfigurationTemplates && UnitConfigurationTemplates.length > 0) {
        console.log(UnitConfigurationTemplates)
        configTemplateRows = UnitConfigurationTemplates.map((template: any, i:number) => {
              return {
                  id: template.recId,
                  name: template.name,
                  type: template.type,
                  indicator: template.indicator
              }
          })
      }
      setRows(configTemplateRows);
      setReformattedRows(configTemplateRows);
  
    }
  
    React.useEffect(() => {
      setData();
    }, [UnitConfigurationTemplates]);

    const searchText = (
      rowsParam: ConfigTemplate[],
      headCells: HeadCellProps[],
      colIdx: number
    ) => {
  
      const onChange = (valuesObject: ValueString[]) => {
        headCells[colIdx].headerArray = valuesObject;
        onSelection(valuesObject, colIdx);
      };
  
      const onSelection = (v: ValueString[], colIdx: number) => {
        if (v.length > 0) {
          for (var i = 0; i < v.length; i++) {
            let searchDataValue = onSetSearchDataValue(v, headCells, colIdx);
            setSearchData((prevArr) =>
              prevArr.filter(
                (e) => e.columnName !== headCells[colIdx].id.toString()
              )
            );
            setSearchData((prevArr) => [...prevArr, searchDataValue]);
          }
        } else {
          setSearchData((prevArr) =>
            prevArr.filter((e) => e.columnName !== headCells[colIdx].id.toString())
          );
        }
      };
  
      return (
        <TextSearch headCells={headCells} colIdx={colIdx} onChange={onChange} />
      );
    };
    

    const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([
      {
        label: `${t("ID")}`,
        id: "id",
        align: "right",
        dataComponent: () => null,
        sort: true,
        searchFilter: true,
        searchComponent: () => null,
        keyCol: true,
        visible: false,
        minWidth: "80",
        maxWidth: "100",
      },
      {
        label: `${t("Name")}`,
        id: "name",
        align: "left",
        dataComponent: configTemplate,
        sort: true,
        searchFilter: true,
        searchComponent: searchText,
        minWidth: "100",
        maxWidth: "100",
        detailedDataComponentId: "id",
      },
      {
        label: `${t("Type")}`,
        id: "type",
        align: "left",
        dataComponent: (e: string) => textDisplay(e, ""),
        sort: true,
        searchFilter: true,
        searchComponent: searchText,
        minWidth: "100",
        maxWidth: "100",
      },
      {
        label: `${t("Indicator")}`,
        id: "indicator",
        align: "left",
        dataComponent: (e: string) => textDisplay(e, ""),
        sort: true,
        searchFilter: true,
        searchComponent: searchText,
        minWidth: "100",
        maxWidth: "100",
      }
    ]);


    useEffect(() => {
      dataArrayBuilder();
  }, [searchData]);


  const dataArrayBuilder = () => {
    if (reformattedRows !== undefined) {
        let dataRows: ConfigTemplate[] = reformattedRows;
        searchData.forEach((el: SearchObject) => {
          if (el.columnName === "name" || el.columnName === "type" || el.columnName === "indicator" )
                dataRows = onTextCompare(dataRows, headCells, el);
           

        }
        );
        setRows(dataRows);
    }
};

    const resizeRow = (e: { colIdx: number; deltaX: number }) => {
      let headCellReset = onResizeRow(e, headCells);
      setHeadCells(headCellReset);
    };
  
    const clearAll = () => {
      setSearchData([]);
      let headCellReset = onClearAll(headCells);
      setHeadCells(headCellReset);
    };
  
    const onSetHeadCells = (e: HeadCellProps[]) => {
      let headCellsArray = onSetSingleHeadCellVisibility(headCells, e);
      setHeadCells(headCellsArray);
    };

  //   const list = [
  //     {label: "BC03" , router: "BC03"},
  //     {label: "BC04" , router: "/assets"},
  //     {label: "In-Car" , router: "In-Car"},
  //     {label: "Master Dock" , router: "Master Dock"}
  // ]
    return (
        <div style={{ marginLeft: "6%", marginTop: "10%" }}>

              {/* <CRXMenu 
                id="menuCreateTemplate"
                name="Create Template"
                btnClass="CreateElementButton"
                className="CreateElementMenu"
                MenuList = {list}
                disableRipple={true}
                horizontal="left"
            /> */}
         <Menu
          style={{backgroundColor:'#FFFFFF'}}
        align="start"
        viewScroll="initial"
        direction="bottom"
        position="auto"
        arrow
        menuButton={
          <MenuButton>
            Create Template
          </MenuButton>
        }
      >
        <MenuItem >
        <Link to={{pathname:'/admin/unitanddevices/createtemplate/BC04',state:{id:0 , isedit:false, type:"BCO4"}}}>
          <div style={{backgroundColor:'#FFFFFF'}}>BC04</div>
        </Link>
        </MenuItem>
        <MenuItem >
        <Link to={{pathname:'/admin/unitanddevices/createtemplate/BC03',state:{id:1 , isedit:false, type:"BCO3"}}}> 
            <div    style={{backgroundColor:'#FFFFFF'}}>BC03</div> 
            </Link>     
        </MenuItem>
        <MenuItem >
        <Link to="/admin/unitanddevices/createtemplate/BC03Lte"> 
            <div  style={{backgroundColor:'#FFFFFF'}}>BC03 Lte</div> 
            </Link>     
        </MenuItem>
      </Menu >


          {
            rows && (
            <CRXDataTable
              id="unitConfifTemplateDataTable"
              actionComponent={<ConfigTemplateActionMenu
                row={selectedActionRow}
               />}

               getRowOnActionClick={(val: any) => setSelectedActionRow(val)}
              showToolbar={true}
           
              dataRows={rows}
              headCells={headCells}
           
              orderParam={order}
              orderByParam={orderBy}
              searchHeader={true}
           
              columnVisibilityBar={true}
              allowDragableToList={true}
             
              className="ManageAssetDataTable crxTableHeight bucketDataTable"
              onClearAll={clearAll}
              getSelectedItems={(v: ConfigTemplate[]) => setSelectedItems(v)}
              onResizeRow={resizeRow}
              onHeadCellChange={onSetHeadCells}
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
            
              showActionSearchHeaderCell={true}
              showCountText={false}
              showCustomizeIcon={true} 
              dragVisibility={false}
              showCheckBoxesCol={true}
              showActionCol={true}
              />
            )
          }
        </div>
      )
}

export default ConfigurationTemplates