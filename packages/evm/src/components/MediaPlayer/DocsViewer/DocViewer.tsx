import React, { useEffect, useRef } from 'react';
import { CRXButton } from '@cb/shared';
import axios from 'axios';
import { assetdata } from '../../../Application/Assets/Detail/AssetDetailsTemplateModel';
import Restricted from '../../../ApplicationPermission/Restricted';
import "./DocViewer.scss";
interface DocViewerProps {
  data: assetdata;
}

const DocViewer: React.FC<DocViewerProps> = ({data}) => {

    const ThumbnailIcon = (): any => {
        let fileType = data.files[0]?.typeOfAsset;
        if (fileType != undefined || fileType != null) {
            switch (fileType) {
                case "ExcelDoc":
                return <i className="fas fa-file-excel tumbFontIcon"></i>;
                case "CSVDoc":
                return <i className="fas fa-file-csv tumbFontIcon"></i>;
                case "WordDoc":
                return <i className="fas fa-file-word tumbFontIcon"></i>;
                default:
                return <div className="Unspecified-file-type">
                    <i className="fa-solid fa-file"></i>
                </div>;
            }
        }
    }

    const downloadDoc = () => {
        const link = document.createElement("a");
        link.href = data.files[0]?.downloadUri;
        link.click();
    };

    return (
    <div className="otherMainDoc">
        <div className='otherIcon'>
            {ThumbnailIcon()}
            <div className='docName'>{data.name}</div>
        </div>
        
    <div className="docActionButton">
        <Restricted moduleId={60}>
        <CRXButton color="primary btnPdfDownload" onClick={()=>downloadDoc()} variant="contained"><i className="far fa-download"/> Download </CRXButton>
        </Restricted>
    </div>
    </div>
    );
}
export default DocViewer
