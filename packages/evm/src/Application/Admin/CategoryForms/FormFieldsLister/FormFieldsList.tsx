import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import textDisplay from "../../../../GlobalComponents/Display/TextDisplay";
import { useDispatch, useSelector } from "react-redux";
import CategoryFormsTemplateActionMenu from './FormFieldsTemplateActionMenu';
import TextSearch from "../../../../GlobalComponents/DataTableSearch/TextSearch";
import './formFieldsList.scss'
import { RootState } from "../../../../Redux/rootReducer";
import { CRXButton, CRXDataTable, CRXToaster } from "@cb/shared";
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
  GridFilter
} from "../../../../GlobalFunctions/globalDataTableFunctions";
import { getAllCategoriesFilter } from '../../../../Redux/Categories';
import Restricted from "../../../../ApplicationPermission/Restricted";
import { CBXMultiCheckBoxDataFilter } from "@cb/shared";
import FormFieldsDetail from "./FormFieldsDetail";
import { FormFieldsTemplate } from "../TypeConstant/types";
import { controlTypes } from "../TypeConstant/constants";
import { getAllFormFieldsFilter } from "../../../../Redux/FormFields";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

interface renderCheckMultiselect {
  value: string,
  id: string,
}

const ORDER_BY = "asc" as Order;
const ORDER_BY_PARAM = "recordingStarted";

const FormFieldsList: React.FC = () => {
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<string>("LastLogin");
  const retentionMsgFormRef = useRef<typeof CRXToaster>(null);
  const [isSearchable, setIsSearchable] = React.useState<boolean>(false)
  const { t } = useTranslation<string>();
  const [id, setId] = React.useState<number>(0);
  const [title, setTitle] = React.useState<string>("");
  const [rows, setRows] = React.useState<FormFieldsTemplate[]>([]);
  const [searchData, setSearchData] = React.useState<SearchObject[]>([]);
  const [selectedItems, setSelectedItems] = React.useState<FormFieldsTemplate[]>([]);
  const [selectedActionRow, setSelectedActionRow] = useState<FormFieldsTemplate[]>();
  const [success, setSuccess] = React.useState<boolean>(false);
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
    size: rowsPerPage
  })
  const dispatch = useDispatch();
  const isFirstRenderRef = useRef<boolean>(true);
  const [reformattedRows, setReformattedRows] = React.useState<FormFieldsTemplate[]>([]);
  const filterFormFields: any = useSelector((state: RootState) => state.FormFieldsSlice.filterFormFields);

  useEffect(() => {
    setFormFields();
    isFirstRenderRef.current = false;
    let headCellsArray = onSetHeadCellVisibility(headCells);
    setHeadCells(headCellsArray);
    onSaveHeadCellData(headCells, "CategoriesTemplateDataTable");
  }, []);
  
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

  useEffect(() => {
    if(searchData.length > 0){
      setIsSearchable(true)
    }
  }, [searchData]);

  const searchText = (
    rowsParam: FormFieldsTemplate[],
    headCell: HeadCellProps[],
    colIdx: number
  ) => {
    return (
      <TextSearch headCells={headCell} colIdx={colIdx} onChange={(valueObject) => onChange(valueObject, colIdx)} />
    );
  };

  const changeMultiselect = (
    val: renderCheckMultiselect[],
    colIdx: number
  ) => {
    onSelection(val, colIdx);
    headCells[colIdx].headerArray = val;
  };

  const searchAndNonSearchMultiDropDown = (
    rowsParam: FormFieldsTemplate[],
    headCells: HeadCellProps[],
    colIdx: number,
    initialRows: any,
    isSearchable: boolean
  ) => {
    let options: any[] = [];
    // For those properties which contains an array
    if (colIdx === 3) {
      controlTypes?.map((x: any) => {
        options.push({ id: x.id, value: x.displayText });
      });
      options = options?.length > 0 ? options?.sort((a: any, b: any) => a.value > b.value ? 1 : -1,) : [];


      return (
        <CBXMultiCheckBoxDataFilter 
          width = {245} 
          option={options} 
          defaultValue={headCells[colIdx].headerArray !== undefined ? headCells[colIdx].headerArray?.filter((v: any) => v.value !== "") : []}
          onChange={(value : any) => changeMultiselect(value, colIdx)}
          onSelectedClear = {() => clearAll()}
          isCheckBox={true}
          multiple={true}
          isduplicate={true}
          selectAllLabel="All"
        />
      );
    }
  };
  
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
      width: "100",
      maxWidth: "150",
    },
    {
      label: `${t("Field_Display_Name")}`,
      id: "displayName",
      align: "left",
      dataComponent: (e: string, id: number) => {
        return <div style={{ cursor: "pointer", color: "var(--color-c34400)" }} onClick={(e) => onClickOpenModel(true, id, t("Edit_Form_Fields"))} className={"dataTableText txtStyle"}>{e}</div>
      },
      sort: false,
      searchFilter: true,
      searchComponent: searchText,
      minWidth: "300",
      width: "400",
      maxWidth: "400",
      attributeName: "displayName",
      attributeType: "String",
      attributeOperator: "contains"
    },
    {
      label: `${t("Field_Name")}`,
      id: "name",
      align: "left",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      searchFilter: true,
      searchComponent: searchText,
      minWidth: "300",
      width: "493",
      maxWidth: "400",
      attributeName: "name",
      attributeType: "String",
      attributeOperator: "contains"
    },
    {
      label: `${t("Control_Type")}`,
      id: "controlType",
      align: "left",
      dataComponent: (e: string) => textDisplay(e, " "),
      sort: false,
      searchFilter: true,
      searchComponent: (
        rowData: FormFieldsTemplate[],
        columns: HeadCellProps[],
        colIdx: number,
        initialRow: any
      ) => searchAndNonSearchMultiDropDown(rowData, columns, colIdx, reformattedRows, false),
      minWidth: "300",
      width: "200",
      maxWidth: "800",
      attributeName: "ControlType",
      attributeType: "List",
      attributeOperator: "contains"
    }
  ]);

  const setFormFields = () => {
    let FormFieldsTemplateRows: FormFieldsTemplate[] = [];
    if (filterFormFields?.data && filterFormFields?.data.length > 0) {
      FormFieldsTemplateRows = filterFormFields?.data.map((template: any) => {
        return {
          id: template?.id,
          name: template?.name,
          displayName: template?.display?.caption,
          controlType :controlTypes?.find((x:any) => x.value ==template?.type)?.displayText,
        }
      })
    }

    setRows(FormFieldsTemplateRows);
    setReformattedRows(FormFieldsTemplateRows);
  }

  React.useEffect(() => {
    setFormFields();
  }, [filterFormFields?.data]);

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

  const getFilteredFormFieldsData = () => {
    pageiGrid.gridFilter.filters = []
    searchData.filter(x => x.value[0] !== '').forEach((item: any, index: number, id: any) => {
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

    if (page !== 0)
      setPage(0)
    else
      dispatch(getAllFormFieldsFilter(pageiGrid))

    setIsSearchable(false);
  }


  const handleKeyDown = (event:any) => {
    if (event.key === 'Enter') {
      getFilteredFormFieldsData();
    }
  }

  useEffect(() => {
    if (paging)
      dispatch(getAllFormFieldsFilter(pageiGrid));
    setPaging(false)
  }, [pageiGrid])

  useEffect(() => {
    setPageiGrid({...pageiGrid, page:page, size:rowsPerPage, gridSort:{field: orderBy, dir: order}});  
    setPaging(true);
  },[page, rowsPerPage])

  const handleBlur = () => {
    if(isSearchable) {     
      getFilteredFormFieldsData();
    }
  }

  return (
    <ClickAwayListener onClickAway={handleBlur}>
    <div className="CrxCategoriesTable switchLeftComponents" onKeyDown={handleKeyDown}>
      <CRXToaster ref={retentionMsgFormRef} />
      {
        rows && (
          <CRXDataTable
            id="CategoriesTemplateDataTable"
            actionComponent={<CategoryFormsTemplateActionMenu
              row={selectedActionRow}
              selectedItems={selectedItems}
              onClickOpenModel={onClickOpenModel}
              pageGrid={pageiGrid}
            />}
            toolBarButton={
              <>
                <Restricted moduleId={0}>

                  <CRXButton className="CategoriesBtn" onClick={() => { onClickOpenModel(true, 0, t("Create_Form_Fields")) }}>
                    {t("Create_Form_Fields")}
                  </CRXButton>
                </Restricted>
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
            orderParam={ORDER_BY}
            orderByParam={ORDER_BY_PARAM}
            dragVisibility={false}
            showCheckBoxesCol={true}
            showActionCol={true}
            searchHeader={true}
            allowDragableToList={false}
            showActionSearchHeaderCell={true}
            className="crxTableHeight crxTableDataUi CategoriesTableTemplate CategoriesTable_UI"
            onClearAll={clearAll}
            getSelectedItems={(v: FormFieldsTemplate[]) => setSelectedItems(v)}
            onResizeRow={resizeRowConfigTemp}
            onHeadCellChange={onSetHeadCells}
            setSelectedItems={setSelectedItems}
            selectedItems={selectedItems}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={(pages: any) => setPage(pages)}
            setRowsPerPage={(setRowsPages: any) => setRowsPerPage(setRowsPages)}
            totalRecords={filterFormFields?.totalCount}
            offsetY={20}
            dragableHeaderPosition={207}
            topSpaceDrag={5}
          />

        )
      }
      {
          openModel &&
          (<FormFieldsDetail id={id} title={title} pageiGrid={pageiGrid} openModel={updateOpenModel} isCategoryForms={false} setSelectedFields={null} selectedFields={null} setFieldValue={null}/>)
      }
    </div>
    </ClickAwayListener>
  );
};

export default FormFieldsList;
