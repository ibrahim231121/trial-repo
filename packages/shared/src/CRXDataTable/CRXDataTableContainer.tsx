import React  from "react";
import Table from "@material-ui/core/Table";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import {
  useStyles,
  DataTableContainerProps,
} from "./CRXDataTableTypes";
import DataTableBody from "./CRXDataTableBody";
import CRXDataTableStickyHeaders from './CRXDataTableStickyHeaders'
const DataTableContainer: React.FC<DataTableContainerProps> = ({
  id,
  keyId,
  orderColumn,
  headCells,
  orderData,
  selectedItems,
  container,
  actionComponent,
  page,
  rowsPerPage,
  className,
  searchHeader,
  onHandleClick,
  onHandleRequestSort,
  onMoveReorder,
  onReorderEnd,
  onResizeRow,
  allColHide,
  getRowOnActionClick,
  dragVisibility,
  showCheckBoxesCol,
  showActionCol,
  showActionSearchHeaderCell,
  onSetCheckAll,
  checkAllPageWise,
  initialRows,
  offsetY,
  showHeaderCheckAll,
  selfPaging,
  searchHeaderPosition,
  dragableHeaderPosition,
  topSpaceDrag,
  viewName,
  expanViews,
  totalRecords,
  selfSorting
}) => {

  const classes : any = useStyles();
  const [bodyCellWidth, setBodyCellWidth] = React.useState<any>()

  return (
    <>
  
    <TableContainer
      className={classes.container + " AssetsDataGrid tableScrollValue " + className}
      component={Paper}
    >
     
      <Table
        data-qa="table"
        className={"CRXDataTableCustom  tableHeaderVisibility " + classes.table}
        style={{
          width: `${allColHide === undefined || allColHide ? "140px" : "auto"}`,
        }}
        aria-label="simple table"
        size="small"
        stickyHeader
      >
        
        <CRXDataTableStickyHeaders
          id={id}
          orderColumn={orderColumn}
          headCells={headCells}
          orderData={orderData}
          selectedItems={selectedItems}
          container={container}
          initialRows={initialRows}
          actionComponent={actionComponent}
          searchHeader={searchHeader}
          page={page}
          onMoveReorder={onMoveReorder}
          onReorderEnd={(e: any, _) => onReorderEnd(e, _)}
          onResizeRow={(e: any) => onResizeRow(e)}
          getRowOnActionClick={getRowOnActionClick}
          onHandleRequestSort={(e) => onHandleRequestSort(e)}
          onSetCheckAll={onSetCheckAll}
          dragVisibility={dragVisibility}
          showCheckBoxesCol={showCheckBoxesCol}
          showActionCol={showActionCol}
          showActionSearchHeaderCell={showActionSearchHeaderCell}
          showHeaderCheckAll={showHeaderCheckAll}
          checkAllPageWise={checkAllPageWise}
          setBodyCellWidth={setBodyCellWidth}
          offsetY={offsetY}
          searchHeaderPosition={searchHeaderPosition}
          dragableHeaderPosition={dragableHeaderPosition}
          topSpaceDrag={topSpaceDrag}
          viewName={viewName}
          expanViews={expanViews}
          selfSorting={selfSorting}
        />

        <DataTableBody
            page={page}
            rowsPerPage={rowsPerPage}
            orderColumn={orderColumn}
            selectedItems={selectedItems}
            headCells={headCells}
            container={container}
            actionComponent={actionComponent}
            keyId={keyId}
            onSetSelectedItems={(row: any) => onHandleClick(row)}
            getRowOnActionClick={getRowOnActionClick}
            dragVisibility={dragVisibility}
			      showCheckBoxesCol={showCheckBoxesCol}
            showActionCol={showActionCol}
            bodyCellWidth={bodyCellWidth}
            selfPaging={selfPaging}
            totalRecords={totalRecords}
          />
      </Table>
      <div className="scrollControler"></div>
    </TableContainer>
      
    </>
  );
};

export default DataTableContainer;
