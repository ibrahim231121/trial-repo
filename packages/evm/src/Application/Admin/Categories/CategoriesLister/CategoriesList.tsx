import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import textDisplay from "../../../../GlobalComponents/Display/TextDisplay";
import { useDispatch, useSelector } from "react-redux";
import TextSearch from "../../../../GlobalComponents/DataTableSearch/TextSearch";
import './categoriesList.scss'
import { RootState } from "../../../../Redux/rootReducer";
import { CRXButton, CRXDataTable, CBXMultiSelectForDatatable, CRXTooltip } from "@cb/shared";
import { enterPathActionCreator } from '../../../../Redux/breadCrumbReducer';
import CategoriesDetail from "../CategoriesDetail/CategoriesDetail";
import {
  SearchObject,
  ValueString,
  HeadCellProps,
  onResizeRow,
  Order,
  onSetSingleHeadCellVisibility,
  onSetSearchDataValue,
  onClearAll,
  onSetHeadCellVisibility,
  onSaveHeadCellData,
  PageiGrid,
  onTextCompare,
  GridFilter
} from "../../../../GlobalFunctions/globalDataTableFunctions";
import { CRXToaster } from "@cb/shared";
import { getAllCategoriesFilter } from '../../../../Redux/Categories';
import Restricted from "../../../../ApplicationPermission/Restricted";
import { getAllCategoryForms } from "../../../../Redux/CategoryForms";
import { getAllRetentionPolicies, getAllUploadPolicies } from "../../../../Redux/RetentionPolicies";
import ApplicationPermissionContext from "../../../../ApplicationPermission/ApplicationPermissionContext";
import { renderCheckMultiselect } from "../../../Assets/AssetLister/AssetDataTable/AssetDataTableModel";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import CategoriesTemplateActionMenu from "./CategoriesTemplateActionMenu";

type CategoriesTemplate = {
  id: number;
  name: string;
  retentionPolicyId: number;
  retentionPolicyName: string;
  uploadPolicyId: number;
  uploadPolicyName: string;
  audio: boolean;
  description: string;
}

const CategoriesList: React.FC = () => {
  const retentionMsgFormRef = useRef<typeof CRXToaster>(null);
  const { t } = useTranslation<string>();
  const [isSearchable, setIsSearchable] = React.useState<boolean>(false)
  const [id, setId] = React.useState<number>(0);
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<string>("LastLogin");
  const [title, setTitle] = React.useState<string>("");
  const [rows, setRows] = React.useState<CategoriesTemplate[]>([]);
  const [searchData, setSearchData] = React.useState<SearchObject[]>([]);
  const [selectedItems, setSelectedItems] = React.useState<CategoriesTemplate[]>([]);
  const [selectedActionRow, setSelectedActionRow] = useState<CategoriesTemplate[]>();
  const [success, setSuccess] = React.useState<boolean>(false);
  const { getModuleIds, moduleIds } = useContext(ApplicationPermissionContext);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(25);
  const [paging, setPaging] = React.useState<boolean>();
  const [openModel, setOpenModel] = React.useState<boolean>(false);
  const [pageiGrid, setPageiGrid] = React.useState<PageiGrid>({
    gridFilter: {
      logic: "and",
      filters: []
    },
    page: page,
    size: rowsPerPage,
    gridSort: {
      field: orderBy,
      dir: order
    }
  })
  const dispatch = useDispatch();
  const isFirstRenderRef = useRef<boolean>(true);
  const [reformattedRows, setReformattedRows] = React.useState<any>([]);
  const filterCategories: any = useSelector((state: RootState) => state.categoriesSlice.filterCategories);
  const retentionPoliciesList: any = useSelector((state: RootState) => state.retentionPoliciesSlice.getAllRetentionPolicies);
  const uploadPoliciesList: any = useSelector((state: RootState) => state.retentionPoliciesSlice.getAllUploadPolicies);
  const [uploadPolicesOptions, setUploadPolicesOptions] = React.useState<any[]>([]);
  const [retentionPoliciesOptions, setRetentionPoliciesOptions] = React.useState<any[]>([]);
  
  useEffect(() => {
    if (paging)
      dispatch(getAllCategoriesFilter(pageiGrid))
    setPaging(false)
  }, [pageiGrid])


  useEffect(() => {
    setCategoriesData();
    isFirstRenderRef.current = false;
    let headCellsArray = onSetHeadCellVisibility(headCells);
    setHeadCells(headCellsArray);
    onSaveHeadCellData(headCells, "CategoriesTemplateDataTable");
    dispatch(enterPathActionCreator({ val: "" }));
  }, []);

  const setUploadPolicies = () => {
    let uploadPoliciesRows: any[] = [];
    if (uploadPoliciesList?.data && uploadPoliciesList?.data.length > 0) {
      uploadPoliciesRows = uploadPoliciesList?.data?.map((template: any) => {
        return {
          id: template.id,
          name: template.name,
        }
      })
    }
    setUploadPolicesOptions(uploadPoliciesRows);
  }

  const setRetentionPolicies = () => {
    let retentionPoliciesRows: any[] = [];
    if (retentionPoliciesList?.data && retentionPoliciesList?.data.length > 0) {
      retentionPoliciesRows = retentionPoliciesList?.data?.map((template: any) => {
        return {
          id: template.id,
          name: template.name,
        }
      })
    }
    setRetentionPoliciesOptions(retentionPoliciesRows);
  }

  const setData = () => {
    setRetentionPolicies();
    setUploadPolicies();
    setCategoriesData();
  }

  useEffect(() => {
    setData();
  },[uploadPoliciesList, retentionPoliciesList])

  const onChange = (valuesObject: ValueString[], colIdx: number) => {
    headCells[colIdx].headerArray = valuesObject;
    onSelection(valuesObject, colIdx);
  }

  const onSelection = (v: ValueString[], colIdx: number) => {
    if (v.length > 0) {
      for (let i = 0; i < v.length; i++) {
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
        prevArr.filter(
          (e) => e.columnName !== headCells[colIdx].id.toString()
        )
      );
    }
  }

  const searchText = (
    rowsParam: CategoriesTemplate[],
    headCell: HeadCellProps[],
    colIdx: number
  ) => {
    return (
      <TextSearch headCells={headCell} colIdx={colIdx} onChange={(valueObject) => onChange(valueObject, colIdx)} />
    );
  };

  const openEditForm = (categoryId: number) => {
    if (getModuleIds().includes(54)) {
      onClickOpenModel(true, Number(categoryId), t("Edit_Category"))
    }
  }

  const changeMultiselect = (
    e: React.SyntheticEvent,
    val: renderCheckMultiselect[],
    colIdx: number
  ) => {
    onSelection(val, colIdx);
    headCells[colIdx].headerArray = val;
  };

  const searchAndNonSearchMultiDropDown = (
    rowsParam: CategoriesTemplate[],
    headCells: HeadCellProps[],
    colIdx: number,
    initialRows: any,
    isSearchable: boolean
  ) => {
    if(colIdx === 3 && initialRows && initialRows.retentionPolcies && initialRows.retentionPolcies.length > 0) { 
      let options: any = [];
      initialRows.retentionPolcies.map((x: any) => {
        options.push({id : x.id, value: x.name });
      });
      

      return (
        <CBXMultiSelectForDatatable
          width={220}
          option={options}
          value={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
          onChange={(e: any, value: any) => changeMultiselect(e, value, colIdx)}
          onSelectedClear={() => clearAll()}
          isCheckBox={false}
          isduplicate={true}
        />
      );
    }
    else if(colIdx === 4 && initialRows && initialRows.uploadPolicies && initialRows.uploadPolicies.length > 0) { 
      let options: any = [];
      initialRows.uploadPolicies.map((x: any) => {
        options.push({id : x.id, value: x.name });
      });


      return (
        <CBXMultiSelectForDatatable
          width={220}
          option={options}
          value={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
          onChange={(e: any, value: any) => changeMultiselect(e, value, colIdx)}
          onSelectedClear={() => clearAll()}
          isCheckBox={false}
          isduplicate={true}
        />
      );
    }
  };

  const NonField = () => {

  }

  const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([
    {
      label: t("ID"),
      id: "id",
      align: "right",
      dataComponent: () => null,
      sort: false,
      searchFilter: false,
      searchComponent: () => null,
      keyCol: true,
      visible: false,
      minWidth: "80",
      width: "",
      maxWidth: "100",
    },
    {
      label: `${t("Category_Name")}`,
      id: "name",
      align: "left",
      dataComponent: (e: string, id: number) => {
        return <div style={{ cursor: "pointer", color: "var(--color-c34400)" }} onClick={(e) => openEditForm(id)} className={"dataTableText txtStyle"}>{e}</div>
      },
      sort: false,
      searchFilter: true,
      searchComponent: searchText,
      minWidth: "300",
      width: "500",
      maxWidth: "600",
      attributeName: "Name",
      attributeType: "String",
      attributeOperator: "contains"
    },
    {
      label: `${t("Description")}`,
      id: "description",
      align: "left",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      searchFilter: true,
      searchComponent: searchText,
      minWidth: "300",
      maxWidth: "600",
      attributeName: "Description",
      attributeType: "String",
      attributeOperator: "contains"
    },
    {
      label: `${t("Evidence_Retention_Policy")}`,
      id: "retentionPolicyName",
      align: "left",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      searchFilter: true,
      searchComponent: (
        rowData: CategoriesTemplate[],
        columns: HeadCellProps[],
        colIdx: number,
        initialRow: any
      ) => searchAndNonSearchMultiDropDown(rowData, columns, colIdx, initialRow, false),
      minWidth: "400",
      maxWidth: "400",
      attributeName: "RetentionPolicyName",
      attributeType: "Equals",
      attributeOperator: "contains"
    },
    {
      label: `${t("Upload_Policy")}`,
      id: "uploadPolicyName",
      align: "left",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      searchFilter: true,
      searchComponent: (
        rowData: CategoriesTemplate[],
        columns: HeadCellProps[],
        colIdx: number,
        initialRow: any
      ) => searchAndNonSearchMultiDropDown(rowData, columns, colIdx, initialRow, false),
      minWidth: "400",
      maxWidth: "400",
      attributeName: "UploadPolicyName",
      attributeType: "Equal",
      attributeOperator: "contains"
    },
    {
      label: `${t("Audio")}`,
      id: "hasAudio",
      align: "left",
      dataComponent: (e: boolean) => SpeakerIcon(e),
      sort: false,
      searchFilter: true,
      searchComponent: NonField,
      minWidth: "400",
      maxWidth: "500"
    },

  ]);
  const SpeakerIcon = (e: any) => {
    return e ? <i className="fa-solid fa-volume"></i> : <></>
  }
  const setCategoriesData = () => {
    let CategoriesTemplateRows: CategoriesTemplate[] = [];

    if (filterCategories?.data && filterCategories?.data.length > 0) {
      CategoriesTemplateRows = filterCategories?.data.map((template: any) => {
        return {
          id: template.id,
          name: template.name,
          retentionPolicyId: template.policies.retentionPolicyId,
          retentionPolicyName: template.policies.retentionPolicyName,
          uploadPolicyId: template.policies.uploadPolicyId,
          uploadPolicyName: template.policies.uploadPolicyName,
          Audio: "",
          hasAudio: template.hasAudio,
          description: template.description,
        }
      })
    }
    setRows(CategoriesTemplateRows);
    setReformattedRows({...reformattedRows, rows: CategoriesTemplateRows, uploadPolicies: uploadPolicesOptions, retentionPolcies: retentionPoliciesOptions});
  }

  const dataArrayBuilder = () => {
    let dataRows: CategoriesTemplate[] = reformattedRows;
    searchData.forEach((el: SearchObject) => {
      dataRows = onTextCompare(dataRows, headCells, el);
    });
    setRows(dataRows);
  };

  React.useEffect(() => {
    setCategoriesData();
  }, [filterCategories?.data]);

  React.useEffect(() => {
    // dispatch(getAllCategoriesFilter(pageiGrid));
    dispatch(getAllRetentionPolicies());
    dispatch(getAllUploadPolicies());
    dispatch(getAllCategoryForms());
  }, [])

  useEffect(() => {
    if(searchData.length > 0){
      getFilteredCategoryData()
      setIsSearchable(true)
    }
  }, [searchData]);

  const resizeRowConfigTemp = (e: { colIdx: number; deltaX: number }) => {
    let headCellReset = onResizeRow(e, headCells);
    setHeadCells(headCellReset);
  };

  const clearAll = () => {
    pageiGrid.gridFilter.filters = []
    dispatch(getAllCategoriesFilter(pageiGrid));
    setSearchData([]);
    let headCellReset = onClearAll(headCells);
    setHeadCells(headCellReset);
  };

  const onSetHeadCells = (e: HeadCellProps[]) => {
    let headCellsArray = onSetSingleHeadCellVisibility(headCells, e);
    setHeadCells(headCellsArray);

  };

  const onClickOpenModel = (modelOpen: boolean, id: number, title: string) => {
    setId(id);
    setTitle(title);
    setOpenModel(modelOpen);
  }

  const updateOpenModel = (modelOpen: boolean) => {
    setOpenModel(modelOpen);
    dispatch(getAllCategoriesFilter(pageiGrid))
  }

  const getFilteredCategoryData = () => {
    pageiGrid.gridFilter.filters = []
    searchData.filter(x => x.value[0] !== '').forEach((item:any, index:number) => {
        let x: GridFilter = {
          operator: headCells[item.colIdx].attributeOperator,
          field: headCells[item.colIdx].attributeName,
          value: item.value.length > 1 ? item.value.join('@') : item.value[0],
          fieldType: headCells[item.colIdx].attributeType,
        }
        pageiGrid.gridFilter.filters?.push(x)
    })
    pageiGrid.page = 0
    pageiGrid.size = rowsPerPage
   
    if(page !== 0)
      setPage(0)
    else
      dispatch(getAllCategoriesFilter(pageiGrid));
    
    setIsSearchable(false)
}

useEffect(() => {
  setPageiGrid({...pageiGrid, page:page, size:rowsPerPage, gridSort:{field: orderBy, dir: order}});  
  setPaging(true);
},[page, rowsPerPage])

const sortingOrder = (sort: any) => {
  setPageiGrid({...pageiGrid, gridSort:{field: sort.orderBy, dir:sort.order}})
  setPaging(true)
}

const handleKeyDown = (event:any) => {
  if (event.key === 'Enter') {
    getFilteredCategoryData()
  }
}
const handleBlur = () => {
  if(isSearchable) {     
    getFilteredCategoryData()
  }
}

  return (
    <ClickAwayListener onClickAway={handleBlur}>
    <div className="switchLeftComponents" onKeyDown={handleKeyDown}>
      <CRXToaster ref={retentionMsgFormRef} />
      {
        rows && (
          <CRXDataTable
            id="CategoriesTemplateDataTable"
            actionComponent={<CategoriesTemplateActionMenu
              row={selectedActionRow}
              selectedItems={selectedItems}
              onClickOpenModel={onClickOpenModel}
            />}
            toolBarButton={
              <>


                <CRXButton className="CategoriesBtn" onClick={() => { onClickOpenModel(true, 0, t("Create_Category")) }}>
                  {t("Create_Category")}
                </CRXButton>

              </>
            }
            showTotalSelectedText={false}
            showToolbar={true}
            showCountText={false}
            columnVisibilityBar={false}
            showCustomizeIcon={false}
            getRowOnActionClick={(val: any) => setSelectedActionRow(val)}
            dataRows={rows}
            headCells={headCells}
            orderParam={order}
            orderByParam={orderBy}
            dragVisibility={false}
            showCheckBoxesCol={false}
            showActionCol={true}
            searchHeader={true}
            allowDragableToList={false}
            showActionSearchHeaderCell={true}
            className="crxTableHeight crxTableDataUi CategoriesTableTemplate CategoriesTable_UI"
            onClearAll={clearAll}
            getSelectedItems={(v: CategoriesTemplate[]) => setSelectedItems(v)}
            onResizeRow={resizeRowConfigTemp}
            onHeadCellChange={onSetHeadCells}
            setSelectedItems={setSelectedItems}
            selectedItems={selectedItems}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={(pages: any) => setPage(pages)}
            setRowsPerPage={(setRowsPages: any) => setRowsPerPage(setRowsPages)}
            totalRecords={filterCategories?.totalCount}
             //Please dont miss this block.
            offsetY={-27}
            topSpaceDrag = {5}
            searchHeaderPosition={222}
            dragableHeaderPosition={187}
            stickyToolbar={133}
            //End here
            initialRows={reformattedRows}
          />

        )
      }
      {
        openModel &&
        (<CategoriesDetail id={id} title={title} pageiGrid={pageiGrid} openModel={updateOpenModel} />)
      }
    </div>
    </ClickAwayListener>
  );
};

export default CategoriesList;
