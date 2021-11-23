
import React, { useEffect } from "react";
import { CRXDataTable, CRXColumn } from "@cb/shared";
import { useTranslation } from "react-i18next";
import textDisplay from "../../../../components/DateDisplayComponent/TextDisplay";
import { useDispatch, useSelector } from "react-redux";
import { getUsersInfoAsync } from "../../../../Redux/UserReducer";
import { RootState } from "../../../../Redux/rootReducer";
import {
    SearchObject,
    ValueString,
    HeadCellProps,
    onResizeRow,
    Order,
    onTextCompare,
    onDateCompare,
    onSetSingleHeadCellVisibility,
    onSetSearchDataValue,
    onClearAll,
    onSaveHeadCellData,
    onSetHeadCellVisibility
} from "../../../../utils/globalDataTableFunctions";
import TextSearch from "../../../../components/SearchComponents/TextSearch";
import { CRXButton } from "@cb/shared";
import multitextDisplay from "../../../../components/DateDisplayComponent/MultiTextDisplay";
import MultSelectiDropDown from "../../../../components/SearchComponents/MultSelectiDropDown";

type User = {
    id: number;
    userName: string,
    firstName: string,
    lastName: string,
    groups: string[]
}
type infoProps = {
    ids: Number[],
    onChangeUserIds: any
}

const User: React.FC<infoProps> = ({ ids, onChangeUserIds }) => {
    const { t } = useTranslation<string>();
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(getUsersInfoAsync());

        let headCellsArray = onSetHeadCellVisibility(headCells);
        setHeadCells(headCellsArray);
        onSaveHeadCellData(headCells, "group-userDataTable");
    }, []);

    const users: any = useSelector((state: RootState) => state.userReducer.usersInfo);
    const [rows, setRows] = React.useState<User[]>([]);
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<string>("recordingStarted");
    const [searchData, setSearchData] = React.useState<SearchObject[]>([]);
    const [selectedItems, setSelectedItems] = React.useState<User[]>([]);
    const [reformattedRows, setReformattedRows] = React.useState<User[]>();
    const [selectedActionRow, setSelectedActionRow] = React.useState<User>();

    const setData = () => {
        let userRows: User[] = [];
        if (users && users.length > 0) {
            userRows = users.map((user: any) => {
                return {
                    id: user.recId,
                    userName: user.userName,
                    firstName: user.fName,
                    lastName: user.lName,
                    groups: user.userGroups != null ? user.userGroups.split(',').map((x: string) => {
                        return x.trim();
                    }) : []
                }
            })
        }
        //set selected users in edit case
        let selectedUsers = userRows.filter(x => {
            if (ids.indexOf(x.id) > -1)
                return x;
        });
        setSelectedItems(selectedUsers);
        setRows(userRows)
        setReformattedRows(userRows);
    }

    React.useEffect(() => {
        if (rows.length > 0) {
            onChangeUserIds(selectedItems.map(x => x.id));
        }
    }, [selectedItems]);

    React.useEffect(() => {
        setData();
    }, [users]);

    const searchText = (
        rowsParam: User[],
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
            label: `${t("Username")}`,
            id: "userName",
            align: "left",
            dataComponent: (e: string) => textDisplay(e, ""),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "100",
            maxWidth: "100",
            visible: true,
        },
        {
            label: `${t("First Name")}`,
            id: "firstName",
            align: "left",
            dataComponent: (e: string) => textDisplay(e, ""),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "100",
            maxWidth: "100",
            visible: true,
        },
        {
            label: `${t("Last Name")}`,
            id: "lastName",
            align: "left",
            dataComponent: (e: string) => textDisplay(e, ""),
            sort: true,
            searchFilter: true,
            searchComponent: searchText,
            minWidth: "100",
            maxWidth: "100",
            visible: true,
        },
        {
            label: `${t("Groups")}`,
            id: "groups",
            align: "left",
            dataComponent: (e: string[]) => multitextDisplay(e, ""),
            sort: true,
            searchFilter: true,
            searchComponent: () => { }, //(rowData: User[], columns: HeadCellProps[], colIdx: number) => searchAndNonSearchMultiDropDown(rowData, columns, colIdx, true),
            minWidth: "135",
        },
    ]);
    const searchAndNonSearchMultiDropDown = (
        rowsParam: User[],
        headCells: HeadCellProps[],
        colIdx: number,
        isSearchable: boolean,
    ) => {
        const onSetSearchData = () => {
            setSearchData((prevArr) =>
                prevArr.filter((e) => e.columnName !== headCells[colIdx].id.toString())
            );
        };

        const onSetHeaderArray = (v: ValueString[]) => {
            headCells[colIdx].headerArray = v;
        };

        return (
            <MultSelectiDropDown
                headCells={headCells}
                colIdx={colIdx}
                reformattedRows={reformattedRows !== undefined ? reformattedRows : rowsParam}
                // reformattedRows={reformattedRows}
                isSearchable={isSearchable}
                onMultiSelectChange={onSelection}
                onSetSearchData={onSetSearchData}
                onSetHeaderArray={onSetHeaderArray}
            />
        );
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
    useEffect(() => {
        dataArrayBuilder();
    }, [searchData]);

    const dataArrayBuilder = () => {
        if (reformattedRows !== undefined) {
            let dataRows: User[] = reformattedRows;
            searchData.forEach((el: SearchObject) => {
                if (el.columnName === "userName" || el.columnName === "firstName" || el.columnName === "lastName" || el.columnName === "email" || el.columnName === "groups" || el.columnName === "status")
                    dataRows = onTextCompare(dataRows, headCells, el);
                if (el.columnName === "lastLogin")
                    dataRows = onDateCompare(dataRows, headCells, el);

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
    return (
        <div>
            {rows && (
                <CRXDataTable
                    id="group-userDataTable"
                    actionComponent={() => { }}
                    getRowOnActionClick={() => { }}
                    showToolbar={true}
                    dataRows={rows}
                    headCells={headCells}
                    orderParam={order}
                    orderByParam={orderBy}
                    searchHeader={true}
                    columnVisibilityBar={true}
                    allowDragableToList={false}
                    className="ManageAssetDataTable crxTableHeight bucketDataTable"
                    onClearAll={clearAll}
                    getSelectedItems={(v: User[]) => setSelectedItems(v)}
                    onResizeRow={resizeRow}
                    onHeadCellChange={onSetHeadCells}
                    setSelectedItems={setSelectedItems}
                    selectedItems={selectedItems}
                    dragVisibility={false}
                    showCheckBoxes={true}
                    showActionCol={false}
                    showActionSearchHeaderCell={false}
                    showCountText={false}
                    showCustomizeIcon={false}
                    showTotalSelectedText={true}
                />
            )
            }
        </div>
    )
}

export default User
