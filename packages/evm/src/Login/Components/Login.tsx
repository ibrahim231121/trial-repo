import {CRXButton} from '@cb/shared';
import {CRXPaper} from '@cb/shared';
import  React, { useEffect } from "react";
import getacVideoSolution from '../../Assets/Images/getacVideoSolution.png';
import { utils } from "../../utils/settings";
import { AUTHENTICATION_LOGIN_URL } from '../../utils/Api/url'
import {useTranslation} from 'react-i18next';
import { useSelector } from "react-redux";
import { RootState } from "./../../Redux/rootReducer";
import { AuthenticationAgent} from "../../utils/Api/ApiAgent";

export default function Login (){
  
  React.useEffect(() => {
    AuthenticationAgent.getAzureCred().then((response:any) => {
      localStorage.setItem("clientId",JSON.stringify(response.applicationClientId))
      localStorage.setItem("tenantId",JSON.stringify(response.applicationTenantId))
    });

    
 
},[])
  const {t} = useTranslation();
    let culture: string = useSelector(
      (state: RootState) => state.cultureReducer.value
    );
    const buttonClick = () => {
        window.location.href = AUTHENTICATION_LOGIN_URL+`${utils(culture)}`;
      };
        return (
            <div className="login_box" >
            <CRXPaper className="main_box">
            <CRXPaper className="box_paper">
                <div className="inner_paper_box">
                  <img  src={getacVideoSolution} className="box_paper_h1"/>
                  <p className="box_paper_h2">
                  {t('Login To Getac Enterprise using Getac Authentication')}
                  </p>

                  {/* <p className="box_paper_h3">
                  {t('Inspiring statement about Getac / Getac product that is relevant to user')}
                  </p> */}
                  
                  <p className="box_paper_span">
                  {t('You are accessing a restricted information system. Your usage may be monitored, recorded and subject to audit. Unauthorized use of the system is prohibited and may be subject to criminal and/or civil penalties. By using this system and clicking “Log In”, you consent to your usage being monitored and recorded.')}
                  </p>
                  <CRXButton className="button_login" 
                  onClick={() => {
            buttonClick();
          }}
          >
                 {t('Log In')}
                  </CRXButton>
                </div>
            </CRXPaper>
            </CRXPaper>
            </div>
        )
    
}
