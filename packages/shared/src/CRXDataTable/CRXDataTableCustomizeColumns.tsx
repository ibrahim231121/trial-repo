import React, { useState, useEffect, useCallback } from 'react';
import Menu from '@material-ui/core/Menu';
import CRXButton from '../controls/CRXButton/CRXButton'
import CRXTypography from '../CRXTypography/Typography'
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SortableList from "./CRXDataTableSortableContainer";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import CRXCheckBox from '../controls/CRXCheckBox/CRXCheckBox'
import {useTranslation} from 'react-i18next'; 
import { HeadCellProps, DataTableCustomizeColumnsProps, OrderValue } from "./CRXDataTableTypes"

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

const DataTableCustomizeColumns: React.FC<DataTableCustomizeColumnsProps> = ({headCells, orderingColumn, onReorder, onChange, onHeadCellChange}) => {

  const {t} = useTranslation<string>();
  const chkStyle = checkboxStyle();
  const [customizeColumn, setCustomize] = useState<Element | undefined | null>(null)
  //const [selected, setSelected] = React.useState<HeadCellProps[]>(headCells);  
  const [orderColumn, setOrderColumn] = useState(orderingColumn)
  const stateArry = headCells.map((i : HeadCellProps) => {
    return i.id;
  })
  const [dragState, setDragState] = useState<any>(stateArry);
  const [onPreset, setOnPreSet] = useState<boolean>()

  useEffect(() => {

    let checkOrderPreset = localStorage.getItem("checkOrderPreset");
    if(checkOrderPreset !== null)
      setOnPreSet(true)
    else
      setOnPreSet(false)  

  },[])

  useEffect(() => {
    setOrderColumn(orderingColumn)
  }, [orderingColumn])

  function onSavecloseHandle() {

    let checkOrderPreset = orderColumn.map((i, _) => {
      let rObj: OrderValue = {
      order: i,
      value: headCells[i].visible
      }
      return rObj
    })

    if(onPreset)
      localStorage.setItem("checkOrderPreset", JSON.stringify(checkOrderPreset));
    else
      localStorage.removeItem("checkOrderPreset");

    setCustomize(null)    
  }

  const resetToCustomizeDefault = () => {

    let local_headCells = localStorage.getItem("headCells");  
    
    if(local_headCells !== null)
    {
      let headCells_private = JSON.parse(local_headCells)
      //setSelected(headCells_private)
      onHeadCellChange(headCells_private)
    }
    
    let sortOrder = orderColumn.sort((a: number, b: number) => a - b)
    setOrderColumn(sortOrder)
  }

  const handleCustomizeChange = (checked: boolean, index: number) => {
    
    // selected[index].visible = checked;     
    // setSelected(prevState  => ({...prevState}))

    let headCellsArray = headCells.map((headCell: HeadCellProps, i: number) => {
      if(i === index)
        headCell.visible = checked
      return headCell
    }) 
    onHeadCellChange(headCellsArray)
    onChange()
  }

  const reorderEnd = useCallback(    
    ({ oldIndex, newIndex}, e) => {
      const newOrder = [...orderColumn];
      const moved = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved[0]);
      setOrderColumn(newOrder);
      onReorder(newOrder);
      var dx = document.querySelector(".ghostView");
      if(dx != null) {
        dx.children[1].remove();
        dx.className = "";
      }
      for(var i in Object.entries(e.target.children)){
            const clax = Object.entries<any>(e.target.children)[i][1];
            if(clax.className === "ghostView")
            Object.entries<any>(e.target.children)[i][1].className = "";
            const targetState = headCells[i];
            if(targetState != undefined)
            setDragState({[targetState.id] : false});
      }
    },
    [orderColumn, setOrderColumn]
    
  );

  const sortableStart = (e:any) => {
    e.helper.className = "onSortDragable";
    e.helper.innerHTML += '<i class="fas fa-grip-vertical sortAbledragIcon"></i>';
    e.node.className = "ghostView";
    e.node.innerHTML += '<i class="fas fa-grip-vertical sortAbledragIcon"></i>';  
  }

  const sortOverFunc = (e : any) => {
    const head = headCells[e.newIndex].id;
      if(e.newIndex > 0 ) {
        
        e.nodes[e.newIndex].node.style.transform = "translate3d(0px, 0px, 0px)";
        setDragState({[head] : true})
      }
  }

  return (

    <div className="dataTableColumnShoHide">
        <Tooltip title="Customize Columns" placement="top-start">         
          <IconButton
            aria-controls="CustomizeColumns"
            className="dataIconButton"
            aria-haspopup="true"
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setCustomize(e.currentTarget)}
            disableRipple={true}
            >
            <i className="fas fa-columns"></i>
          </IconButton>
        </Tooltip>
        <Menu
            id="CustomizeColumns"
            anchorEl={customizeColumn}
            className="columnReOrderOpup"
            getContentAnchorEl={null}
            keepMounted= {true}
            disableScrollLock= {false} 
            open={Boolean(customizeColumn)}
            onClose={() => setCustomize(null)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            >
            <div className="popupFreezTitle">
            <div style={{position:'absolute', top:"-10px", right:"0px"}}>
                <IconButton aria-label="clear" disableRipple={true} className="closePopup"  onClick={() => setCustomize(null)} >
                <span className="icon-cross2"></span>
                
                </IconButton>
            </div>
            
            <CRXTypography className="DRPTitle" variant="h3" >{t('Customizecolumns')}</CRXTypography>
            <CRXTypography className="subTItle" variant="h5" >{t('Select to show a column. Drag and drop to recorder.')}</CRXTypography>
            </div>
            <div className="columnList">
            <SortableList 
                orderColumn={orderColumn} 
                headCells={headCells} 
                chkStyle={chkStyle} 
                dragHideState={dragState}
                hideSortableGhost={false}
                disableAutoscroll={false}
                lockAxis="y"
                onSortStart={sortableStart}
                onSortEnd={reorderEnd}
                onSortOver={sortOverFunc}
                lockToContainerEdges={true}
                transitionDuration={0}
                onReOrderChange={handleCustomizeChange}/>
            </div>
            <div className="footerDRPReOrder">
            
                <CRXButton 
                id="closeDropDown"
                onClick={onSavecloseHandle}
                color="primary"
                variant="contained" 
                className="closeDRP"
                >
                    {t('Saveandclose')}
                </CRXButton>
            
                <CRXButton 
                id="resetCheckBox"
                onClick={resetToCustomizeDefault}
                color="default"
                variant="outlined" 
                className="resetCheckBox"
                >
                    {t('Resettodefault')}
                </CRXButton>
            
                <FormControlLabel
                  control={<CRXCheckBox checked={onPreset}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOnPreSet(e.target.checked)}
                      className="shoHideCheckbox"
                      inputProps="primary checkbox"
                      />}
                  label={t('Saveaspreset')}
                  labelPlacement="end"
                />
            
            
            </div>
        </Menu>
    </div>  
  );
};

export default DataTableCustomizeColumns;