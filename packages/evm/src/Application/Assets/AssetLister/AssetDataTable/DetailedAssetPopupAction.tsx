import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import "@szhsin/react-menu/dist/index.css";
import "./index.scss";
import { CRXConfirmDialog, CRXToaster } from '@cb/shared';
import { getAssetSearchInfoAsync } from '../../../../Redux/AssetSearchReducer';
import { CRXAlert } from "@cb/shared";
import { useTranslation } from "react-i18next";
import { EvidenceAgent } from '../../../../utils/Api/ApiAgent';
import ActionMenu from "../ActionMenu";
import { SearchType } from "../../utils/constants";
import { ActionMenuPlacement } from "../ActionMenu/types";


type Props = {
  row?: any;
  asset: any;
  selectedItems?: any;
};

const DetailedAssetPopupAction: React.FC<Props> = React.memo(({ row, asset, selectedItems }) => {
  const { t } = useTranslation<string>();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [alertType, setAlertType] = React.useState<string>("inline");
  const [alert, setAlert] = React.useState<boolean>(false);
  const [responseError, setResponseError] = React.useState<string>("");
  const [errorType, setErrorType] = React.useState<string>("error");
  const [showSuccess, setShowSuccess] = React.useState<boolean>(true);
  const DetailedPopupMsgRef = React.useRef<typeof CRXToaster>(null);
  const [isPrimaryAsset, setIsPrimaryAsset] = React.useState(true)
  const message = [
    { messageType: "success", message: `${asset.assetName}` + ` ${t("is_successfully_set_as_primary_asset")}` },
  ];

  useEffect(() => {
  }, [isOpen]);

  const handlePrimaryAsset = () => {
    setIsOpen(true);
  };

  const showToastMsg = () => {
    DetailedPopupMsgRef.current.showToaster({
      message: message[0].message,
      variant: "success",
      duration: 4000,
      clearButtton: true,
    });
  };

  const onConfirm = async () => {
    const url = '/Evidences/' + `${row.id}` + '/setAsPrimaryAsset/' + `${asset.assetId}`
    EvidenceAgent.setPrimaryAsset(url).then(() => {
      setIsOpen(false);
      setTimeout(async () => { dispatch(getAssetSearchInfoAsync({ QUERRY: "", searchType: SearchType.SimpleSearch })) }, 1000);
      showToastMsg();
    })
      .catch(function (error) {
        setAlert(true);
        setResponseError(
          t("We_re_sorry._The_form_was_unable_to_be_saved._Please_retry_or_contact_your_Systems_Administrator")
        );
        return error;
      });
  };

  const reformatRowPropData = (row: any, asset: any) => {
    let newObj: any = {};
    newObj = { ...asset };
    newObj.evidence = row;
    return newObj;
  }
  const reformatSelectedAsset = (selectedAssets: any[]) => {
    const filteredArray = selectedAssets.filter(x => x.isChecked == true);
    if (filteredArray.length > 0) {
      filteredArray.forEach(element => {
        element.evidence = row;
      });
    }
    return filteredArray;
  }

  return (
    <>
      <CRXConfirmDialog
        className={`crx-unblock-modal __set__Primary__Modal__ ${alert === true ? "__crx__Set_primary_Show" : "__crx__Set_primary_Hide"} `}
        title={t("Please_confirm")}
        setIsOpen={setIsOpen}
        onConfirm={onConfirm}
        isOpen={isOpen}
        buttonPrimary="Yes, set as primary"
        buttonSecondary="No, do not set as primary">
        {
          <div className='crxUplockContent'>
            <CRXAlert
              className={"CrxAlertNotificationGroup"}
              message={responseError}
              type={errorType}
              open={alert}
              alertType={alertType}
              showCloseButton={false}
              setShowSucess={setShowSuccess}
            />
            <p>
              {t("You_are_attempting_to")} <b> {t("set_the '")}{asset.assetName}{t("' as_the_primary_asset")}</b>.
            </p>
            <p>
              {t("Are_you_sure_would_like_to")} <b> {t("set '")}{asset.assetName}{t("' asset_as_the_primary_asset")}</b>?
            </p>
          </div>
        }
      </CRXConfirmDialog>
      <ActionMenu
        row={reformatRowPropData(row, asset)}
        selectedItems={reformatSelectedAsset(selectedItems)}
        asset={asset}
        showToastMsg={() => showToastMsg()}
        setIsPrimaryOptionOpen={setIsOpen}
        isPrimaryOptionOpen={isPrimaryAsset}
        actionMenuPlacement={ActionMenuPlacement.DetailedAssets}
      />
    </>
  );
});

export default DetailedAssetPopupAction;
