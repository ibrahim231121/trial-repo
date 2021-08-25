import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {
  SearchHeaderProps,
  useStyles,
} from "./CRXDataTableTypes";

const SearchHeader: React.FC<SearchHeaderProps> = ({
  orderColumn,
  selectedItems,
  headCells,
  orderData,
  container,
  actionComponent
}) => {
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow>
        <TableCell
          className={
            classes.searchHeaderStickness +
            " TableSearchAbleHead tableSearchHead"
          }
          style={{ left: 0, position: "sticky", zIndex: 4 }}
        ></TableCell>
        <TableCell
          padding="checkbox"
          className={classes.searchHeaderStickness + " TableSearchAbleHead"}
          style={{ left: 55, position: "sticky", zIndex: 4 }}
        ></TableCell>
        <TableCell
          className={classes.searchHeaderStickness + " TableSearchAbleHead"}
          style={{ left: 113, position: "sticky", zIndex: 4 }}
        >
          <div
            className={
              selectedItems.length > 1 ? "" : "disableHeaderActionMenu"
            }
          >
            {actionComponent}
          </div>
        </TableCell>
        {orderColumn.map((colIdx, _) => (
          <TableCell
            className={classes.searchHeaderStickness + " TableSearchAbleHead"}
            style={{
              display: `${
                headCells[colIdx].visible === undefined ||
                headCells[colIdx].visible === true
                  ? ""
                  : "none"
              }`,
            }}
            key={colIdx}
            align={
              headCells[colIdx].align === "right"
                ? "right"
                : headCells[colIdx].align === "left"
                ? "left"
                : "center"
            }
            //padding={headCells[colIdx].disablePadding ? 'none' : 'default'}
            sortDirection={
              orderData.orderBy === headCells[colIdx].id
                ? orderData.order
                : false
            }
          >
            {headCells[colIdx].searchFilter === true
              ? headCells[colIdx].searchComponent(
                  container.rows,
                  headCells,
                  colIdx
                )
              : null}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default SearchHeader;
