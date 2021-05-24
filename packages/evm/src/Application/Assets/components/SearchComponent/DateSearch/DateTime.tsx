import React, { useEffect } from "react";
import DatePickerIcon from "./DatePickerIcon";
import { CRXDropDown, CRXSelectBox, CRXDropContainer } from "@cb/shared";
import { dateOptions } from "../../../../../utils/constant";
import "./DateTime.scss";
import { DateContext } from "../DateContext";

const DateTime: React.FC = () => {
  const { setSelectedOption, selectedOptionValue ,endDate , startDate , setStartDateValue,
    setEndDateValue,} =
    React.useContext(DateContext);

  const [open, setOpen] = React.useState(false);
  const [dropDownValue, setDropDownValue] = React.useState(null);
  const [dateOptionsState, setDateOptionsState] = React.useState(dateOptions);
  const [state, setstate] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  
  const onSelectionChange = (e: any) => {
    const { value } = e.target;
    setSelectedOption(value);
    if (value==="custom") {
      setStartDateValue("")
      setEndDateValue("")
    }
  };


  const CRXdropContainer = () => {
      setstate(state == false ? true : false);
  }

  // React.useEffect(() => {
    
    
  //     document.addEventListener('click', function() {
  //       setstate(false)
  //     });
    
  //   return () => {
  //     document.removeEventListener('click', CRXdropContainer);
  //   }
  // },[state]);

  const setDropDownValueFunction=(v:any)=>{
    const find = dateOptionsState.filter(x=>x.value!=="customRange")

    if (v==="customRange") {
      setDropDownValue(v)
      find.push({value: "customRange", displayText: `${startDate} - ${endDate}`})
      setDateOptionsState(find)
      setDisabled(true)
    }
   else{
    setDateOptionsState(dateOptions)
    setSelectedOption(v)
    setDropDownValue(null)
    setDisabled(false)


   }
  }

  const data = (
    <DatePickerIcon
      onClose={() => setOpen(false)}
      dropDownCustomValue={(v: any) => setDropDownValueFunction(v)}
    />
  );
  const img = <i className="far fa-calendar-alt"></i>;
  return (
    <div className="dateRangeContainer">
      <label className="dateTimeLabel">Date and Time</label>
      <CRXDropDown
        value={dropDownValue?dropDownValue:selectedOptionValue}
        onChange={onSelectionChange}
        options={dateOptionsState}
        disabled={state || disabled}
      >
        <CRXDropContainer
          icon={img}
          content={data}
          className="dateRangeButton"
          paperClass="CRXDateRange"
          onClick={CRXdropContainer}
          paperState={state}
        />
      </CRXDropDown>
    </div>
  );
};

export default DateTime;
