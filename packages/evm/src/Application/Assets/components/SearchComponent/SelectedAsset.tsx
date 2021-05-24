import React from "react";
import ImageSearchIcon from "@material-ui/icons/ImageSearch";
import { CRXButton } from "@cb/shared";
import "./PredictiveSearchBox/PredictiveSearchBox.scss";
const SelectedAsset = () => {
  return (
    <>
      <div className="listOfContent">
        <div className="listButton">
          <CRXButton className="listParentBtn">
            <i className="far fa-file-search listIcon"></i>
          </CRXButton>
          <div className="count-badge">120</div>
        </div>
        <div className="iconBtnLabel">My Assets</div>
      </div>
      <div className="listOfContent">
        <div className="listButton">
          <CRXButton className="listParentBtn">
          <i className="far fa-file-search listIcon"></i>
          </CRXButton>
          <div className="count-badge">15</div>
        </div>
        <div className="iconBtnLabel">Not Categorized</div>
      </div>
      <div className="listOfContent">
        <div className="listButton">
          <CRXButton className="listParentBtn">
          <i className="far fa-file-search listIcon"></i>
          </CRXButton>
          <div className="count-badge">5</div>
        </div>
        <div className="iconBtnLabel">Approaching Deletion</div>
      </div>
    </>
  );
};

export default SelectedAsset;