import React, { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import "@material-ui/icons"
import Menu from '@material-ui/core/Menu';
import { makeStyles } from '@material-ui/core/styles';
import {DataTableToolbarProps, useToolbarStyles, HeadCellProps} from "./CRXDataTableTypes"
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CRXButton from '../controls/CRXButton/CRXButton'
import CRXTypography from '../CRXTypography/Typography'
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import CRXCheckBox from '../controls/CRXCheckBox/CRXCheckBox'

const checkboxStyle = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: 0,
    border: "1px solid #797979",
    width: 16,
    height: 16,
    boxShadow: 'none',
    backgroundColor: '#fff',
    'input:hover ~ &': {
      backgroundColor: '#797979',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#797979',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
      top:'8px',
      position:"absolute",
      color:'#797979',
    },
    'input:hover ~ &': {
      backgroundColor: '#797979',
    },
  },
});

export default function  EnhancedTableToolbar (props: DataTableToolbarProps){
    const classes = useToolbarStyles();
    const chkStyle = checkboxStyle();
    const { headCells, rowCount, columnVisibilityBar, onChange, onReOrder } = props;
    const [selected, setSelected] = React.useState<HeadCellProps[]>(headCells);
    const [anchorEl, setAnchorEl] = useState<any>(null)
    const [customizeColumn, setCustomize] = useState<any>(null)
    const [orderColumn, setOrderColumn] = useState(
      new Array(headCells.length).fill(null).map((_, i) => i)
    );

    useEffect(() => {
      headCells.map((headCell: any, x) => {
          selected[x].visible = (headCell.visible || headCell.visible === undefined) ? true : false 
          setSelected(prevState  => ({...prevState}))
      }) 
    },[])

    const openHandleClick = (event : any) => {
      setAnchorEl(event.currentTarget);
    }

    const customizeColumnClose = () => {
      setCustomize(null)
    }

    const customizeColumnOpen = (event : any) => {
      setCustomize(event.currentTarget);
    }

    const handleCheckChange = (event: any, index: number) => {
      selected[index].visible = event.target.checked;     
      headCells[index].visible = selected[index].visible 
      setSelected(prevState  => ({...prevState}))
      onChange()
    }

    const handleCustomizeChange = (checked: boolean, index: number) => {
      selected[index].visible =  checked;
      headCells[index].visible = selected[index].visible 
      setSelected(prevState  => ({...prevState}))
      onChange()
    }

    const closeHandle = () => {
      setAnchorEl(null);
    }
   
    const resetToDefault = () => {
      headCells.map((headCell, x) => {
        if(headCell.keyCol === false || headCell.keyCol === undefined)
        {
          selected[x].visible = true
          headCell.visible = selected[x].visible
          setSelected(prevState  => ({...prevState}))
        }
      }) 
      onChange()
    }

    const resetToCustomizeDefault = () => {
      headCells.map((headCell, x) => {
        if(headCell.keyCol === false || headCell.keyCol === undefined)
        {
          selected[x].visible = true 
          headCell.visible = selected[x].visible
          setSelected(prevState  => ({...prevState}))
        }
      }) 
      let sortOrder = orderColumn.sort((a, b) => a - b)
      setOrderColumn(sortOrder)
      onChange()
    }

    const onReorderEnd = useCallback(
      
      ({ oldIndex, newIndex}, _) => {
        //debugger
        const newOrder = [...orderColumn];
        const moved = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved[0]);
        setOrderColumn(newOrder);
        onReOrder(newOrder)
      },
      [orderColumn, setOrderColumn]
    );

    return (
      <Toolbar
        className={clsx(classes.root)}>
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            <b>{rowCount}</b> assets
          </Typography>
        
          <div className="dataTableColumnShoHide">
              { columnVisibilityBar === true ? (
                  <>
                    <IconButton
                      aria-controls="dataTableShowHideOpt"
                      className="dataIconButton"
                      aria-haspopup="true"
                      onClick={openHandleClick}
                      disableRipple={true}
                    >
                      <i className="fas fa-filter"></i>
                    </IconButton>
                    <Menu
                      id="dataTableShowHideOpt"
                      anchorEl={anchorEl}
                      className="checkedDataTable"
                      getContentAnchorEl={null}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={closeHandle}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                    <CRXTypography className="DRPTitle" variant="h3" >Show / hide columns</CRXTypography>
                    <Grid container spacing={2}>
                      {headCells.map((i, index) => {
                       return(  
                                (i.keyCol === false || i.keyCol === undefined) ? 
                                <Grid item xs={6}>
                                <FormControlLabel
                                  value={i.label}
                                  control={<CRXCheckBox checked={selected[index].visible} onChange={(e) => handleCheckChange(e,index)}
                                    checkedIcon={<span className={clsx(chkStyle.icon, chkStyle.checkedIcon)} />}
                                    icon={<span className={chkStyle.icon} />}
                                    className={chkStyle.root + " shoHideCheckbox"}
                                    disableRipple={true} 
                                    color="default" />}
                                  label={i.label}
                                  labelPlacement="end"
                                />
                                </Grid>
                                :
                                null
                              )
                      })}
                    </Grid>
                    <div className="footerDRP">
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <CRXButton 
                          id="closeDropDown"
                          onClick={closeHandle}
                          color="primary"
                          variant="contained" 
                          className="closeDRP"
                          >
                            Close
                          </CRXButton>
                      </Grid>
                      <Grid item xs={6}>
                        <CRXButton 
                          id="resetCheckBox"
                          onClick={resetToDefault}
                          color="default"
                          variant="outlined" 
                          className="resetCheckBox"
                          >
                            Reset to default
                          </CRXButton>
                      </Grid>
                    </Grid>
                    </div>
                    </Menu>
                  
                  </>
                ) : null
              }
          </div>          
          <div className="dataTableColumnShoHide" style={{display:"none"}}>
             <IconButton
                aria-controls="CustomizeColumns"
                className="dataIconButton"
                aria-haspopup="true"
                onClick={customizeColumnOpen}
                disableRipple={true}
              >
                <i className="fas fa-columns"></i>
              </IconButton>
              <Menu
                id="CustomizeColumns"
                anchorEl={customizeColumn}
                className="columnReOrderOpup"
                getContentAnchorEl={null}
                keepMounted
                open={Boolean(customizeColumn)}
                onClose={customizeColumnClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
              <CRXTypography className="DRPTitle" variant="h3" >Customize columns</CRXTypography>
              <ul className="columnList">
                <SortableList 
                  orderColumn={orderColumn} 
                  selected={selected} 
                  chkStyle={chkStyle} 
                  onSortEnd={onReorderEnd} 
                  onReOrderChange={handleCustomizeChange}/>
              </ul>
              <div className="footerDRPReOrder">
              <Grid container spacing={2}>
                <Grid item >
                  <CRXButton 
                    id="closeDropDown"
                    onClick={customizeColumnClose}
                    color="primary"
                    variant="contained" 
                    className="closeDRP"
                    >
                      Save and close
                    </CRXButton>
                </Grid>
                <Grid item>
                  <CRXButton 
                    id="resetCheckBox"
                    onClick={resetToCustomizeDefault}
                    color="default"
                    variant="outlined" 
                    className="resetCheckBox"
                    >
                      Reset to default
                    </CRXButton>
                </Grid>
              </Grid>
              </div>
              </Menu>
          </div>     
      </Toolbar>
    );
};

const SortableItem = SortableElement(({value}: any) => (
  <li tabIndex={0}>{value}</li>
));

const SortableList = SortableContainer((props: any) => {
  const {orderColumn, selected, chkStyle, onReOrderChange} = props;
  const handleCheckChange = (event: any, index: number) => {    
    onReOrderChange(event.target.checked,index)
  }
  return (
    <span>
      {orderColumn.map((colIdx: any, index: number) => (
        <SortableItem 
          key={colIdx} 
          index={index} 
          value={
                  (selected[colIdx].keyCol === false || selected[colIdx].keyCol === undefined) ? 
                    <FormControlLabel
                      value={selected[colIdx].label}
                      control={<Checkbox checked={selected[colIdx].visible} onChange={(e) => handleCheckChange(e,colIdx)}
                      checkedIcon={<span className={clsx(chkStyle.icon, chkStyle.checkedIcon)} />}
                      icon={<span className={chkStyle.icon} />}
                      className={chkStyle.root + " shoHideCheckbox"}
                      disableRipple={true} 
                      color="default" />}
                      label={selected[colIdx].label}
                      labelPlacement="end"
                    />
                  :
                  null
                } 
        />
      ))}
    </span>
  );
});
