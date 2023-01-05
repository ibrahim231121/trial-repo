import React from "react";
import { getQueuedAssetInfoAsync } from "../../Redux/UnitReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/rootReducer";
import { CRXDataTable,CRXProgressBar } from "@cb/shared";
import { useInterval } from 'usehooks-ts'
import {
    HeadCellProps,
    onResizeRow,
    Order,
    onSetSingleHeadCellVisibility,
    onClearAll,
    onSetHeadCellVisibility,onSaveHeadCellData,
    PageiGrid,
  } from "../../GlobalFunctions/globalDataTableFunctions";
import textDisplay from "../../GlobalComponents/Display/TextDisplay";
import { useTranslation } from "react-i18next";
import { QueuedAssets } from "../../utils/Api/models/UnitModels";
import { EvidenceAgent} from '../../utils/Api/ApiAgent';

type infoProps = {
  unitId: any;
}
const QueuedAsstsDataTable :React.FC<infoProps> =  ({unitId})=>{
    const [queuedAssets, setqueuedAssets] =  React.useState<QueuedAssets[]>([]);
    const { t } = useTranslation<string>();
    const [reformattedRows, setReformattedRows] = React.useState<QueuedAssets[]>();
    const [selectedActionRow, setSelectedActionRow] =React.useState<QueuedAssets>();
    const [order] = React.useState<Order>("asc");
    const [orderBy] = React.useState<string>("name");
    const [open, setOpen] = React.useState<boolean>(false);
    const [rows, setRows] = React.useState<QueuedAssets[]>([]);
    const [selectedItems, setSelectedItems] = React.useState<QueuedAssets[]>([]);
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

    const dispatch = useDispatch();
 
  useInterval(
    () => {
      EvidenceAgent.getQueuedAssets(unitId).then((response:QueuedAssets[]) => setqueuedAssets(response));  

      let headCellsArray = onSetHeadCellVisibility(headCells);
      setHeadCells(headCellsArray);
      onSaveHeadCellData(headCells, "Queued_Assets");  
    },
    // Speed in milliseconds or null to stop it
    10000,
  );
  React.useEffect(() => {
    EvidenceAgent.getQueuedAssets(unitId).then((response:QueuedAssets[]) => setqueuedAssets(response));  
    setData();
  }, []);

    const setData = () => {
       let asset: QueuedAssets[] = [];
      
          if (queuedAssets && queuedAssets.length > 0) {
            asset = queuedAssets.map((dt: any, i:number) => {
                  return {
                    filename: dt.fileName,
                    status:  dt.status
                    
                  }
              })
          }
          setRows(asset)
          setReformattedRows(asset);
  
    }
  
    React.useEffect(() => {
      setData();
    }, [queuedAssets]);
  
    const resizeQueuedAssets = (e: { colIdx: number; deltaX: number }) => {
        let headCellReset = onResizeRow(e, headCells);
        setHeadCells(headCellReset);
      };

    const clearAll = () => {
        const clearButton: any = document.getElementsByClassName(
          "MuiAutocomplete-clearIndicator"
        )[0];
        clearButton && clearButton.click();
        setOpen(false);
        let headCellReset = onClearAll(headCells);
        setHeadCells(headCellReset);
      };

      const onSetHeadCells = (e: HeadCellProps[]) => {
        let headCellsArray = onSetSingleHeadCellVisibility(headCells, e);
        setHeadCells(headCellsArray);
      };


      const projectStatusProgress = (e:any) => {
      
        return (            
            <div className="status_grid_loader">
            <CRXProgressBar
            id="raw"
            loadingText='File'
            value={e}
            error={false}
            width={236}
            maxDataSize={true}
          />
          </div>
           
        );
      };

    const tabsIdx : any = window.innerWidth;
    
    const [headCells, setHeadCells] = React.useState<HeadCellProps[]>([
       
        {
          label: `${t("File_Name")}`,
          id: "filename",
          align: "right",
          dataComponent: (e: string) => textDisplay(e, "data_table_fixedWidth_wrapText"),
          sort: true,
          minWidth: `${tabsIdx && tabsIdx / 2 - 270}`,
          visible: true,
        },
        {
          label: `${t("Status")}`,
          id: "status",
          align: "left",
          dataComponent:  (e: any) => projectStatusProgress(e),
          sort: false, 
          minWidth: `${tabsIdx && tabsIdx / 2 - 210}`,
          visible: true,
        }
      
      ]);

    React.useEffect(() => {
      setPageiGrid({...pageiGrid, page:page, size:rowsPerPage}); 
      setPaging(true)
    },[page, rowsPerPage])

    return (
      <div className="unit_detail_tab_events unit_Device_tabUI">
      {rows && (
          <CRXDataTable 
              id="unit_device_queued_tab_table"
              actionComponent={() => { }}
              getRowOnActionClick={() => { }}
              showToolbar={true}
              dataRows={rows}
              initialRows={reformattedRows}
              headCells={headCells}
              orderParam={order}
              orderByParam={orderBy}
              searchHeader={false}
              columnVisibilityBar={true}
              allowDragableToList={false}
              className="unit_detail_tab_events_data_table"
              onClearAll={clearAll}
              getSelectedItems={(v: QueuedAssets[]) => setSelectedItems(v)}
              onResizeRow={resizeQueuedAssets}
              onHeadCellChange={onSetHeadCells}
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
              dragVisibility={false}
              showCheckBoxes={false}
              showActionCol={false}
              showActionSearchHeaderCell={false}
              showCountText={false}
              showCustomizeIcon={false}
              showTotalSelectedText={false}
              lightMode={false}
              offsetY={45}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage= {(page:any) => setPage(page)}
              setRowsPerPage= {(rowsPerPage:any) => setRowsPerPage(rowsPerPage)}
              totalRecords={500}
              stickyToolbar={0}
          />
      )}
      </div>
    )
}

export default QueuedAsstsDataTable

