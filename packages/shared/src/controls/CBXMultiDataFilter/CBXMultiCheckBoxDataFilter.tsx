/* eslint-disable no-use-before-define */
import React, { useLayoutEffect, useRef, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ClickAwayListener } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Popper from '@material-ui/core/Popper';
import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import "./cbxCheckboxDataFilter.scss"

const selectStyled = makeStyles((_: Theme) =>
  createStyles({
    root: {
      position : "relative",
      margin: "auto",
      '& : hover' : {
        border:"0px",
        borderRadius: "0px",
        outline : "0px",
        boxShadow : "none",
      },
      '&:focus' : {
        border:"0px",
        borderRadius: "0px",
        outline : "0px",
        boxShadow : "none",
      }
    },

  }),
);
const selectBoxStyled = makeStyles({
  
    root: {
      border:"0px",
      borderRadius: "0px",
      outline : "0px",
      boxShadow : "none",
      height : "0px",
    },
    fullWidth: {
        background : "#333"
    },
    focused : {
        border:"0px",
        background: "#404041",
        borderRadius: "0px",
        outline : "0px",
        boxShadow : "none"
    },
    popper : {
        background: "#404041",
        marginTop: "1px",
        marginLeft : "0px",
    },
    paper : {
        background: "#404041",
        borderRadius : "0px",
        border:"0px",
        margin: "0px"
    },

    inputRoot : {
        border:"0px",
        borderRadius : "0px",
        padding:"0px 0px !important",
        
        '& : hover' : {
            border:"0px",
            borderRadius: "0px",
            outline : "0px",
            boxShadow : "none",
          },
          '&:focus' : {
            border:"0px",
            borderRadius: "0px",
            outline : "0px",
            boxShadow : "none",
          }
        
    },
    inputFocused : {
        border:"0px",
        borderRadius: "0px",
        outline : "0px",
        boxShadow : "none",
    },

    option : {
      color:"#d1d2d4",
      fontSize:"14px",
      fontFamily : "Arial, Helvetica, sans-serif, Segoe UI",
      padding : "8px 10px",
      placeItems: "center",
      '&:hover' : {
        background: "#231f20",
        color : "#F5F5F5",
        '&:focus' : {
          background: "#6E6E6E",
          color:"#d1d2d4",
        }
      },
      '&:focus' : {
        background: "#6E6E6E",
        color:"#d1d2d4",
      },

      '&[aria-selected="true"]' : {
        backgroundColor: "#231f20",
        color:"#f5f5f5",
      }
    },

    listbox : {
      paddingTop : "3px"
    }
  }
);

const CheckBoxStyle = makeStyles({

    root : {
      padding:"0px",
    }

})
const ClickInput = styled('div')`
  width : 100%;
  height : 30px;
  outline:1px solid #888787;
  border:2px solid transparent;
  background : #d1d2d4;
  display : flex;
  justify-content: space-between;
  color:#333;
  &.selectedInput {
    border:2px solid #fff
  }
  &:button {
    color : #333
  }
`

const InnerButton = styled('button')`
  width : 100%;
  height : 30px;
  opacity : 1;
  background : none;
  border:0px;
  outline : 0px;
  text-align : right;
  font-size: 18px;
  display: flex;
  justify-content: flex-end;
  color: #333 !important
`
const OverlayWraper = styled('div')`
  width : 100%;
  height : 30px;
  background : #333;
  display : flex;
  justify-content: center;
  align-items: center;
  position : absolute;
  top:0px;
  left : 0px;
`
const SelectButton = styled('button')`
    background : transparent;
    color: #d1d2d4;
    font-size : 14px;
    border:0px;;
    outline : 0px;
    height: 100%;
    width: 40px;
    cursor : pointer
`

// const ClearButton = styled('button')`
//     background : transparent;
//     color: #333;
//     font-size : 14px;
//     border:0px;;
//     outline : 0px;
//     height: 100%;
//     width: 40px;
//     cursor : pointer;
//     padding-top: 5px;
//     .clearItem {
//       font-weight : bold;
//     }
// `
const Tag = styled(({ label, onDelete, ...props }) => (
  <div {...props} className="select_custom_chips">
    <span>{label}</span>
    <button className='chips_btn' onClick={onDelete}>
      <i className='fas fa-times'></i>
    </button>
  </div>
))`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`;

const SingleTag = styled(({ label, ...props }) => (
  <div {...props} className="select_checkBox_chips">
    
    <span>{label}</span>
  </div>
))`
  font-size : 14px;
  color : #333; 
`;

interface LabelType {
    value : string,
    id : number
}

type SelectProps = {
    onChange: (e: any,value:any) => void;
    value:any[];
    option : LabelType[];
    defaultValue ? : any;
    width : number;
    onSelectedClear : (e : any) => void,
    isCheckBox? : boolean,
	  isduplicate? : boolean
    multiple? : boolean
}
export default function CBXMultiCheckBoxDataFilter({onChange, multiple = true, value, option, defaultValue, onSelectedClear, isCheckBox, isduplicate, ...props} : SelectProps) {
  const classes = selectStyled();
  const selectClass = selectBoxStyled();
  const checkBoxClass = CheckBoxStyle()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [singleValue, setSingleValue] = useState<any>()
  const selectRefs = useRef(null)
  
  const icon = <i className='fa-light fa-square checkbox_icon_default'></i>;
  const checkedIcon = <i className="fa-light fa-square-check"></i>;
  const tickMarked = <i className="fa-solid fa-check selectBox_Tick_Marked"></i>

 if(isduplicate) {
    let unique: any = option.map((x: any) => x);
    if (option.length > 0) {
      unique = [];
      unique[0] = option[0];
      for (let i = 0; i < option.length; i++) {
        if (!unique.some((item: any) => item.value === option[i].value)) {
          unique.push(option[i]);
        }
      }
    }
    option = unique
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  
    setAnchorEl(event.currentTarget);
    
  };
  
  const OnCloseHandler = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl);
  const id = open ? 'data-table-filter-select' : undefined;
  useLayoutEffect(() => {
    
    let tableContainer : any = document.querySelector("#customizedStickyHeader")
    if(open == true) {
      tableContainer && (tableContainer.style.overflow = "visible");
    }else {
      tableContainer && (tableContainer.style.overflow = "hidden");
    }
  },[open])
  
  return (
    <ClickAwayListener onClickAway={OnCloseHandler}>
    <div  ref={selectRefs} style={{width : props.width + "px"}} className={"cbx_multi_data_filter " + classes.root}>
    {console.log("value", value)}
    <ClickInput className={'clickable_input ' + `${anchorEl ? "selectedInput" : " clickable_input"}` }>
        
        {value.length > 0 && multiple == true && singleValue ?
        <SingleTag label={singleValue[0].value} /> : "" }

         <InnerButton onClick={(e : React.MouseEvent<HTMLElement>) => handleClick(e)}>
          <i className="fa-solid fa-sort-down"></i>
        </InnerButton>
        {/* {multiple == false && singleValue ? <>
        <SingleTag label={singleValue.value} />
        <ClearButton onClick={(e : any) => onSelectedClear(e)}>
          <i className="icon icon-cross2 clearItem"></i>
        </ClearButton></> :  */}
       
        
      
    </ClickInput>
    
    {value && value.length > 1 && open == false || value.length > 1 && open === true ?  
    <OverlayWraper> 
        <SelectButton onClick={(e : React.MouseEvent<HTMLElement>) => handleClick(e)}>
            <i className='fas fa-filter'></i>
        </SelectButton>  
        <SelectButton onClick={(e : any) => onSelectedClear(e)}><i className="icon icon-cross2"></i></SelectButton>  
    </OverlayWraper>
    : ""}
    
    <Popper
    id={id}
    open={open}
    ref={selectRefs}
    anchorEl={anchorEl}
    disablePortal = {true}
    className="select_popper_Checkbox noHeight"
    container={selectRefs.current}
    placement="bottom-start">
    
      <Autocomplete
        multiple={multiple}
        open
        popupIcon=""
        closeIcon=""
        onClose={OnCloseHandler}
        id="multiple-tags_checkbox"
        options={option}
        onChange={(e,value) => {
            return onChange(e,value);
        }}
        className="data_filter_select_list_checkbox"
        classes = {{
            ...selectClass
        }}
        filterSelectedOptions={false}
        size="medium"
        value={value}
        getOptionLabel={(option) => option.value}
        defaultValue={ defaultValue }
        disableCloseOnSelect={true}
        getOptionSelected={(option: any, value: any) =>
          option.value == value.value
        }
        renderOption={(option, { selected }) => (
          
          <React.Fragment>
            {isCheckBox == true ?
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 10 }}
              checked={selected}
              disableRipple
              className="select_checkbox"
              classes = {{
                ...checkBoxClass
              }}
            />
            : tickMarked}
            {option.value}
          </React.Fragment>
        )}
        renderTags={(tagValue, getTagProps) => {
          setSingleValue(tagValue)
          return tagValue.map((option, index) => (
            <Tag {...getTagProps({ index })} label={option.value} />
          ));
        }}
        renderInput={(params) => (
          <TextField className={'select_Checkbox_input_field ' + `${ value.length > 0 && "bg-dp-value"}` } style={{width : props.width + "px"}} {...params} variant="outlined" />
        )}
      />
      
      </Popper>
      
    </div>
    </ClickAwayListener>
  );
}