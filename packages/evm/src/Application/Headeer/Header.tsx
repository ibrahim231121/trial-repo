import React from 'react'
import { CRXRows, CRXColumn, CRXHeading } from "@cb/shared";
import CRXLeftSideBar from './LeftSideBar'
import CRXDepartment from './AppBarMenu/Department'
import CRXStation from "./AppBarMenu/CRXStation";
import CRXUserProfile from './AppBarMenu/UserProfile'
import CRXAppDropdown from './AppBarMenu/AppBarLinks'
import CRXHelp from './AppBarMenu/Help'
import  CRXActiveBreadcrumb from './Breadcrumb'
import CRXAssetsBucketPanel from './AssetsBucket/CRXBucket'
import CRXNotficationPanel from './CRXNotifications/CRXNotificationPanel';
import CRXGlobalSearchPanel from './CRXGlobalSearch/CRXSearchPanel';
import AppLogo from '../../Assets/Images/getacLogo.png'
import './Header.scss'



interface propsTypes {
    onClick : (e : any) => void,
    onClose : (e : any) => void,
    open : boolean
}

const AppHeader = ({onClick, onClose, open} : propsTypes) => {
    return (
        <div className="CRXAppHeader">
            <CRXRows
                container={true}
                spacing={0}
            >
                <CRXColumn item xs={4}>
                    <div className="CRXLogoMenu">
                        <CRXLeftSideBar 
                            onClick = {onClick}
                            onClose = {onClose}
                            open    = {open}
                        />
                        
                        <CRXAppDropdown />
                        <img src={AppLogo} className="appLogo"/>
                        {/* <CRXHeading align="left" className="AppName"  variant="h4">
                            ENTERPRISE
                        </CRXHeading> */}
                    </div>
                </CRXColumn>
                <CRXColumn item xs={8}>
                    <div className="MasterHeadRight">
                        <ul id="rightMenu">
                            <li><CRXDepartment /></li>
                            <li><CRXUserProfile /></li>
                            <li><CRXHelp /></li>
                        </ul>
                        <div className="panelContent">
                            <CRXAssetsBucketPanel />
                            <CRXNotficationPanel />
                            <CRXGlobalSearchPanel />
                        </div>
                    </div>
                </CRXColumn>
            </CRXRows>
            <CRXActiveBreadcrumb shiftContent={open}/>
        </div>
    )
}

export default AppHeader;