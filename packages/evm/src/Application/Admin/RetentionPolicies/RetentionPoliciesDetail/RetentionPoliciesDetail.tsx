import React, { FC, useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router";
import {
  CRXRadio,
  CRXButton,
  CRXConfirmDialog,
  CRXCheckBox,
  TextField,
  CRXHeading,
  NumberField,
  CRXToaster,
} from "@cb/shared";
import { useTranslation } from "react-i18next";
import { RetentionPoliciesModel } from "../TypeConstant/types";
import {
  retentionTypeTimePeriod,
  retentionTypeDiskSpace,
} from "../TypeConstant/constants";
import "./retentionPoliciesDetail.scss";
import { SetupConfigurationAgent } from "../../../../utils/Api/ApiAgent";
import { enterPathActionCreator } from "../../../../Redux/breadCrumbReducer";
import { useDispatch } from "react-redux";
import { getAllRetentionPoliciesInfoAsync } from "../../../../Redux/RetentionPolicies";
import { PageiGrid } from "../../../../GlobalFunctions/globalDataTableFunctions";
import { RetentionPoliciesDetailModel } from "./RetentionPoliciesDetailModel";

const DataRetention = "DataRetention";

const RetentionPoliciesDetail: FC<RetentionPoliciesDetailModel> = (props) => {
  const defaultRetentionPolicies: RetentionPoliciesModel = {
    id: 0,
    type: DataRetention,
    name: "",
    description: "",
    detail: {
      type: "Age",
      limit: { isInfinite: false, hours: 0, gracePeriodInHours: 0 },
      isDeleted: false,
      space: 0,
    },
    history: {
      version: "",
    },
  };
 
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation<string>();
  const [name, setName] = useState<string>("");
  const [retentionType, setRetentionType] = useState<string>(
    retentionTypeTimePeriod
  );
  const [radioTimePeriod, setRadioTimePeriod] = React.useState(true);
  const [radioDiskSpace, setRadioDiskSpace] = React.useState(false);
  const [retentionTimeDays, setRetentionTimeDays] = useState<number>(0);
  const [retentionHours, setRetentionHours] = useState<number>(0);
  const [retentionTotalHours, setRetentionTotalHours] = useState<number>(0);
  const [softDeleteTimeDays, setSoftDeleteTimeDays] = useState<number>(0);
  const [gracePeriodHours, setGracePeriodHours] = useState<number>(0);
  const [graceTotalPeriodHours, setGraceTotalPeriodHours] = useState<number>(0);
  const [retentionSize, setRetentionSize] = useState<number>(0);
  const [historyVersion, setHistoryVersion] = useState<string>("");
  const [unlimitedRetention, setUnlimitedRetention] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [disableRetentionTimeDays, setDisableRetentionTimeDays] = useState(false);
  const [disableHours, setDisableHours] = useState(false);
  const [disableSoftDeleteTimeDays, setDisableSoftDeleteTimeDays] = useState(false);
  const [disableGracePeriodHours, setDisableGracePeriodHours] = useState(false);
  const retentionMsgFormRef = useRef<typeof CRXToaster>(null);
  const history = useHistory();
  const [isDeleted, setIsDeleted] = React.useState<boolean>(false);
  const [retentionPolicy, setRetentionPolicies] = useState<RetentionPoliciesModel>(defaultRetentionPolicies);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaveDisable, setIsSaveDisable] = useState<boolean>(true);
  const isFirstRenderRef = useRef<boolean>(true);
  const dataToEdit = useRef<RetentionPoliciesModel>(null);
  const dispatch = useDispatch();
  const [UploadPolicyDetailErr, setUploadPolicyDetailErr] = React.useState({
    nameErr: "",
    retentionTimeDaysErr: "",
    retentionSizeErr: "",
  });
  const [pageiGrid, setPageiGrid] = React.useState<PageiGrid>({
    gridFilter: {
      logic: "and",
      filters: []
    },
    page: 1,
    size: 25
  })
  const regexForNumberOnly = new RegExp("^[0-9]+$");
  const RadioTimePeriodBtnValues = [
    {
      id: 1,
      value: "TimePeriod",
      isDisabled: false,
      label: "Time Period",
      Comp: () => {},
      Name: "Age",
    },
  ];

  const RadioDiskSpaceBtnValues = [
    {
      id: 2,
      value: "DiskSpace",
      isDisabled: false,
      label: "Disk Space",
      Comp: () => {},
      Name: "Space",
    },
  ];

  useEffect(() => {
    isFirstRenderRef.current = false;
    if (id != undefined && id != null && parseInt(id) > 0) {
      SetupConfigurationAgent.getRetentionPolicies(parseInt(id))
        .then((response: any) => {
          let retentionPoliciesObj = { ...retentionPolicy };
          setName(response.name);
          setDescription(response.description);
          onRetentionTypeChange(response.detail.type);
          setRetentionTimeSpaceValue(response.detail.limit.hours);
          setSoftDeleteTimeValue(response.detail.limit.gracePeriodInHours);
          setUnlimitedRetention(response.detail.limit.isInfinite);
          setRetentionSize(response.detail.space);
          setRetentionPolicies(response);
          dispatch(enterPathActionCreator({  val: `Retention Policy:  ${response?.name }` }));

          const temp = {
            retentionPolicies: { ...retentionPoliciesObj },
          };
          EditCloseHandler(dataToEdit, temp);
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
    setAddPayload();
    dispatch(enterPathActionCreator({ val: "" }));
    return () => {
      dispatch(enterPathActionCreator({ val: "" }));
      retentionMsgFormRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isFirstRenderRef.current) {
      if (
          (name.length > 2 &&
            ( (radioTimePeriod && (retentionTimeDays > 0 || retentionHours > 0)) || 
              (radioDiskSpace && retentionSize > 0)
            )
          )
        ) 
      {
        setIsSaveDisable(false);
      } else {
        setIsSaveDisable(true);
      }
    }
  }, [name, retentionTimeDays, retentionHours, retentionSize]);

  useEffect(() =>{
    if(unlimitedRetention){
      setDisableGracePeriodHours(true)
      setDisableHours(true)
      setDisableRetentionTimeDays(true)
      setDisableSoftDeleteTimeDays(true)
    }
  },[unlimitedRetention]);

  const onRetentionTypeChange = (type: string) => {
    let isDiskSpace = type == "Space";
    onSetDiskSpace(isDiskSpace);
    onSetTimePeriod(!isDiskSpace);
  };

  const onChangeRetentionType = (isDiskSpace: boolean) => {
    if (isDiskSpace) {
      setRetentionType(retentionTypeDiskSpace);
      setRetentionTimeDays(0);
      setRetentionHours(0);
      setSoftDeleteTimeDays(0);
      setGracePeriodHours(0);
      setUnlimitedRetention(false);
      setDisableRetentionTimeDays(false);
      setDisableHours(false);
      setDisableSoftDeleteTimeDays(false);
      setDisableGracePeriodHours(false);
    } else {
      setRetentionType(retentionTypeTimePeriod);
      setRetentionSize(0);
    }
  };

  const onSetTimePeriod = (isSelect: boolean) => {
    setRadioTimePeriod(isSelect);
    onChangeRetentionType(!isSelect);
  };

  const onSetDiskSpace = (isSelect: boolean) => {
    setRadioDiskSpace(isSelect);
    onChangeRetentionType(isSelect);
  };

  const setRetentionTimeSpaceValue = (hours: number) => {
    let days = parseInt(String(hours / 24));
    let remainingHours = hours - days * 24;

    setRetentionTimeDays(days);
    onRetentionHoursChange(remainingHours, days);
  };

  const setSoftDeleteTimeValue = (hours: number) => {
    let days = parseInt(String(hours / 24));
    let remainingHours = hours - days * 24;

    setSoftDeleteTimeDays(days);

    onGraceHoursChange(remainingHours, days);
  };

  const setRetentionTotalHourValue = (hours: number, days: number) => {
    let totalHours = Number(hours) + Number(days * 24);

    setRetentionTotalHours(totalHours);
  };

  const setGraceTotalPeriodHoursValue = (hours: number, days: number) => {
    let totalHours = Number(hours) + Number(days * 24);

    setGraceTotalPeriodHours(totalHours);
  };

  const EditCloseHandler = (dataToEdit: any, temp: any) => {
    if (dataToEdit.current == null) {
      dataToEdit.current = { ...temp };
    }
  };

  const onRetentionDaysChange = (hours: any, days: any) => {
    if (days < 0 || !regexForNumberOnly.test(days.toString())) {
      days = 0;
    }
    if(days.toString().length > 7)
      days = days.toString().substring(0, days.toString().length - 1);

    setRetentionTimeDays(days);
    setRetentionTotalHourValue(hours, days);
  };

  const onRetentionHoursChange = (hours: any, days: any) => {
    if (hours < 0 || hours > 23 || !regexForNumberOnly.test(hours.toString())) {
      hours = 0;
    }
    setRetentionHours(hours);
    setRetentionTotalHourValue(hours, days);
  };

  const onGraceDaysChange = (hours: any, days: any) => {
    if (days < 0 || !regexForNumberOnly.test(days.toString())) {
      days = 0;
    }
    if(days.toString().length > 7)
      days = days.toString().substring(0, days.toString().length - 1);

    setSoftDeleteTimeDays(days);
    setGraceTotalPeriodHoursValue(hours, days);
  };

  const onGraceHoursChange = (hours: any, days: any) => {
    if (hours < 0 || hours > 23 || !regexForNumberOnly.test(hours.toString())) {
      hours = 0;
    }
    setGracePeriodHours(hours);
    setGraceTotalPeriodHoursValue(hours, days);
  };

  const onDiskSpaceChange = (space: any) => {
    if (space < 0) {
      space = 0;
    }
    setRetentionSize(space);
  };

  const RetentionPolicyDataChanged = (
    retentionPolicies: RetentionPoliciesModel,
    isDataChanged: boolean,
    dataToEdit: RetentionPoliciesModel
  ) => {
    let retentionTypeName =
      retentionPolicy.detail?.type == "Space" ? "DiskSpace" : "TimePeriod";
    if (
      name != retentionPolicy.name ||
      description != retentionPolicy.description ||
      retentionType != retentionTypeName ||
      retentionTotalHours != retentionPolicy.detail?.limit?.hours ||
      graceTotalPeriodHours !=
        retentionPolicy.detail?.limit?.gracePeriodInHours ||
      unlimitedRetention != retentionPolicy.detail?.limit?.isInfinite ||
      retentionSize != retentionPolicy.detail?.space
    ) {
      isDataChanged = true;
    }

    return isDataChanged;
  };

  const redirectPage = () => {
    if (dataToEdit.current != null) {
      let isDataChanged = false;
      isDataChanged = RetentionPolicyDataChanged(
        retentionPolicy,
        isDataChanged,
        dataToEdit.current
      );

      if (isDataChanged === true) {
        setIsOpen(true);
      } else {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  const checkNameValidation = () => {
    let isDisable = true;
    const isPolicyNameValid = validatePolicyName(name);
    if (!name) {
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        nameErr: t("Policy_Name_is_required"),
      });
    }else if (isPolicyNameValid.error) {
      setUploadPolicyDetailErr({
      ...UploadPolicyDetailErr,
      nameErr: isPolicyNameValid.errorMessage,
    }) }  else {
      setUploadPolicyDetailErr({ ...UploadPolicyDetailErr, nameErr: "" });
      isDisable = false;
    }
    return isDisable;
  };

  const checkRententionValidation = () => {
    let isDisable = true;
    if (!retentionTimeDays) {
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        retentionTimeDaysErr: t("Retention_time_is_required"),
      });
    } 
    else if(!maxTextLenghtValidation(retentionTimeDays)){
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        retentionTimeDaysErr: t("Retention_time_is_not_valid"),
      });
    }
    else {
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        retentionTimeDaysErr: "",
      });
      isDisable = false;
    }
    return isDisable;
  };

  const checkRetentionSizeValidation = () => {
    let isDisable = true;
    if (!retentionSize) {
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        retentionSizeErr: t("Retention_size_is_required"),
      });
    } else {
      setUploadPolicyDetailErr({
        ...UploadPolicyDetailErr,
        retentionSizeErr: "",
      });
      isDisable = false;
    }
    return isDisable;
  };
  
  const maxTextLenghtValidation = (arg: number) => {
    if(arg.toString().length > 7)
      return false;
    return true;
  }

  const validatePolicyName = ( name: string):{ error: boolean; errorMessage: string } => {
    const chracterRegx = /^[a-zA-Z][a-zA-Z0-9-_ \b]*$/.test(String(name).toLowerCase());
    if (!chracterRegx) {
      return { error: true, errorMessage: t("Please_provide_a_valid_policy_name") };
    } else if (name.length < 3) {
      return {
        error: true,
        errorMessage: t("Policy_Name_must_contains_atleast_three_characters"),
      };
    } else if (name.length > 128) {
      return {
        error: true,
        errorMessage: t("Policy_Name_must_not_exceed_128_characters"),
      };
    }
    return { error: false, errorMessage: "" };
  };

  const onIndefiniteChange = (e: any, fieldName: string) => {
    let isIndefinite = e.currentTarget.checked;
    if (isIndefinite == true) {
      setRetentionTimeDays(365000);
      setRetentionHours(0);
      setSoftDeleteTimeDays(0);
      setGracePeriodHours(0);
    } else {
      setRetentionTimeDays(0);
      setRetentionHours(0);
    }

    setUnlimitedRetention(isIndefinite);
    setDisableRetentionTimeDays(isIndefinite);
    setDisableHours(isIndefinite);
    setDisableSoftDeleteTimeDays(isIndefinite);
    setDisableGracePeriodHours(isIndefinite);
  };

  const setAddPayload: any = () => {
    const limit = {
      isInfinite: unlimitedRetention,
      hours: Number(retentionHours) + Number(retentionTimeDays * 24),
      gracePeriodInHours:
        Number(gracePeriodHours) + Number(softDeleteTimeDays * 24),
    };

    const detail = {
      type: radioDiskSpace ? "Space" : "Age",
      limit: limit,
      isDeleted: isDeleted,
      space: retentionSize,
    };
    const history = {
      version: historyVersion,
    };
    const retention = {
      id: id ? id : "0",
      type: DataRetention,
      name: name,
      detail: detail,
      description: description,
      history: history,
    };

    return retention;
  };

  const onSave = async () => {
    const payload = setAddPayload();
    if (parseInt(id) > 0) {
      const urlEditRetentionPolicies = "Policies/" + id;
      SetupConfigurationAgent.putRetentionPoliciesTemplate(
        urlEditRetentionPolicies,
        payload)
        .then(() => {
          setRetentionPolicies(defaultRetentionPolicies);
          onMessageShow(true, t("Success_You_have_saved_the_Retention_Policy"));
          dispatch(getAllRetentionPoliciesInfoAsync(pageiGrid));
          setTimeout(() => {
            handleClose();
          }, 500);
        })
        .catch((e: any) => {
          if (e.request.status == 409) {
            onMessageShow(false, t("Duplicate_Name_is_not_allowed"));
          } else {
            onMessageShow(false, e.message.toString());
            return e;
          }
        });
    } else {
      const urlAddRetentionPolicies = "Policies";
      SetupConfigurationAgent.postRetentionPoliciesTemplate(
        urlAddRetentionPolicies,
        payload
      )
        .then(() => {
          setRetentionPolicies(defaultRetentionPolicies);
          onMessageShow(true, t("Success_You_have_saved_the_Retention_Policy"));
          dispatch(getAllRetentionPoliciesInfoAsync(pageiGrid));
          setTimeout(() => {
            handleClose();
          }, 500);
        })
        .catch((e: any) => {
          if (e.request.status == 409) {
            onMessageShow(false, t("Duplicate_Name_is_not_allowed"));
          } else {
            console.error(e.message);
            onMessageShow(false, e.message.toString());
            return e;
          }
        });
    }
  };

  const closeDialog = () => {
    redirectPage();
  };

  const handleClose = () => {
    history.goBack();
}

  const getFormatedLabel = (label: string) => {
    return (
      <span className="requiredLable">
        {label}{" "}
        {label === "Action" ? (
          <span
            style={{ color: "#000", paddingLeft: "8px", fontWeight: "bold" }}
          >
            *
          </span>
        ) : (
          <span></span>
        )}
      </span>
    );
  };

  const RetentionFormMessages = (obj: any) => {
    retentionMsgFormRef?.current?.showToaster({
      message: obj.message,
      variant: obj.variant,
      duration: obj.duration,
      clearButtton: true,
    });
  };

  const onMessageShow = (isSuccess: boolean, message: string) => {
    RetentionFormMessages({
      message: message,
      variant: isSuccess ? "success" : "error",
      duration: 5000,
    });
  };

  return (
    <div className="retention-policies">
      <CRXToaster ref={retentionMsgFormRef} />
      <div className="indicatestext tp15"><b>*</b> Indicates required field</div> 
      <div className="CRXRetentionPolicies">
        <div className="settingsContent CRXSettingContent">
          <span
            className={`gridFilterTextBox ${
              UploadPolicyDetailErr.nameErr ? "retentionPolicyError" : ""
            }`}
          >
            <div className="text-field">
              <TextField
                required={true}
                value={name}
                label={t("Policy_Name")}
                className="retention-policies-input"
                onChange={(e: any) => setName(e.target.value)}
                disabled={false}
                type="text"
                name="retentionPoliciesName"
                regex=""
                onBlur={() => checkNameValidation()}
                error={!!UploadPolicyDetailErr.nameErr}
                errorMsg={UploadPolicyDetailErr.nameErr}
              />
            </div>

            <div className="text-field">
              <TextField
                required={false}
                value={description}
                label={t("Description")}
                className="retention-policies-input"
                onChange={(e: any) => setDescription(e.target.value)}
                disabled={false}
                type="text"
                name="retentionPoliciesDescription"
                regex=""
                multiline={true}
              />
            </div>
          </span>
        </div>

        <div className="retention-type radioRententionPolicies">
          <CRXHeading variant="subtitle1" className="label">
            {getFormatedLabel(t("Retention_Type"))}
          </CRXHeading>
          <div className="rententionPoliciesField">
            <CRXRadio
              className="crxEditRadioBtn"
              content={RadioTimePeriodBtnValues}
              value={retentionType}
              setValue={(e: any) =>
                onRetentionTypeChange(RadioTimePeriodBtnValues[0].Name)
              }
              checked={true}
              name="radio-buttons"
            />
            {radioTimePeriod && (
              <div className="retention-type">
                <div className="retentionPoliciesField">
                  <div
                    className={`number_retention_field_ui ${
                      UploadPolicyDetailErr.retentionTimeDaysErr
                        ? "retentionPolicyError retentionTimeError"
                        : ""
                    }`}
                  >
                    <NumberField
                      required={true}
                      value={retentionTimeDays == 0 ? "" : retentionTimeDays}
                      label={t("Retention_Time")}
                      className="retention-policies-input"
                      onChange={(e: any) =>
                        onRetentionDaysChange(retentionHours, e.target.value)
                      }
                      disabled={disableRetentionTimeDays}
                      type="number"
                      name="retentionTimeDays"
                      regex=""
                      onBlur={() => checkRententionValidation()}
                      error={unlimitedRetention ? false : !!UploadPolicyDetailErr.retentionTimeDaysErr}
                      errorMsg={unlimitedRetention ? "" : UploadPolicyDetailErr.retentionTimeDaysErr}
                    />
                    <label className="dayRetentionLabel">
                      {t("days")}
                      <span></span>
                    </label>
                  </div>
                  <div className="days_retention_field_ui">
                    <NumberField
                      value={retentionHours == 0 ? "" : retentionHours}
                      className="retention-policies-input"
                      onChange={(e: any) =>
                        onRetentionHoursChange(
                          e.target.value,
                          retentionTimeDays
                        )
                      }
                      disabled={disableHours}
                      type="number"
                      name="retentionHours"
                      regex=""
                      min={0}
                      max={23}
                    />
                    <label>
                      {t("hours")}
                      <span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {radioTimePeriod && (
              <div className="retention-type">
                <div className="retentionPoliciesField">
                  <div className="number_retention_field_ui">
                    <NumberField
                      required={false}
                      value={softDeleteTimeDays == 0 ? "" : softDeleteTimeDays}
                      label={t("Soft_Delete_Time")}
                      className="retention-policies-input"
                      onChange={(e: any) =>
                        onGraceDaysChange(gracePeriodHours, e.target.value)
                      }
                      disabled={disableSoftDeleteTimeDays}
                      type="number"
                      name="softDeleteTimeDays"
                      regex=""
                      min={0}
                    />
                    <label className="dayRetentionLabel">
                      {t("days")}
                      <span></span>
                    </label>
                  </div>

                  <div className="days_retention_field_ui  ">
                    <NumberField
                      required={false}
                      value={gracePeriodHours == 0 ? "" : gracePeriodHours}
                      className="retention-policies-input"
                      onChange={(e: any) =>
                        onGraceHoursChange(e.target.value, softDeleteTimeDays)
                      }
                      disabled={disableGracePeriodHours}
                      type="number"
                      name="gracePeriodHours"
                      regex=""
                      min={0}
                      max={23}
                    />
                    <label>
                      {t("hours")}
                      <span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {radioTimePeriod && (
              <div className="retention-type retentionTypeCheck">
                <div className="retentionPoliciesField">
                  <div className="indefinite_checkBox_ui">
                    <CRXCheckBox
                      checked={unlimitedRetention}
                      lightMode={true}
                      className="crxCheckBoxCreate "
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onIndefiniteChange(e, "indefinite")
                      }
                    />
                    <label>
                      {t("Indefinite")}
                      <span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            <CRXRadio
              className="crxEditRadioBtn"
              content={RadioDiskSpaceBtnValues}
              value={retentionType}
              setValue={(e: any) =>
                onRetentionTypeChange(RadioDiskSpaceBtnValues[0].Name)
              }
              name="radio-buttons"
            />

            {radioDiskSpace && (
              <div className="retention-type retentionTypeCheckGb">
                <div
                  className={`retentionPoliciesField ${
                    UploadPolicyDetailErr.retentionSizeErr
                      ? "retentionPolicyError"
                      : ""
                  }`}
                >
                  <div className="number_retention_field_ui">
                    <NumberField
                      required={true}
                      value={retentionSize == 0 ? "" : retentionSize}
                      label={t("Retention_Size")}
                      className="retention-policies-input"
                      onChange={(e: any) => onDiskSpaceChange(e.target.value)}
                      disabled={false}
                      type="number"
                      name="retentionSize"
                      regex=""
                      onBlur={() => checkRetentionSizeValidation()}
                      error={!!UploadPolicyDetailErr.retentionSizeErr}
                      errorMsg={UploadPolicyDetailErr.retentionSizeErr}
                    />
                    <label className="number_retention_label_gb">
                      {t("GB")}
                      <span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
       
      </div>
      <div className="crxFooterEditFormBtn stickyFooter_Tab">
          <div className="__crxFooterBtnUser__">
            <CRXButton
              variant="contained"
              className="primeryBtn"
              onClick={onSave}
              disabled={isSaveDisable}
            >
              {t("Save")}
            </CRXButton>
            <CRXButton
              className="groupInfoTabButtons secondary"
              color="secondary"
              variant="outlined"
              onClick={handleClose}
            >
              {t("Cancel")}
            </CRXButton>
          </div>
          <div className="__crxFooterBtnUser__">
            <CRXButton
              className="groupInfoTabButtons secondary"
              color="secondary"
              variant="outlined"
              onClick={closeDialog}
            >
              {t("Close")}
            </CRXButton>
          </div>
        </div>
      <CRXConfirmDialog
        setIsOpen={() => setIsOpen(false)}
        onConfirm={handleClose}
        isOpen={isOpen}
        className="retentionPoliciesConfirm"
        primary={t("Yes_close")}
        secondary={t("No,_do_not_close")}
        text="retention policy form"
      >
        <div className="confirmMessage">
          {t("You_are_attempting_to")} <strong> {t("close")}</strong> {t("the")}{" "}
          <strong>{t("retention_policy_Form")}</strong>.{" "}
          {t("If_you_close_the_form")},
          {t("any_changes_you_ve_made_will_not_be_saved.")}{" "}
          {t("You_will_not_be_able_to_undo_this_action.")}
          <div className="confirmMessageBottom">
            {t("Are_you_sure_you_would_like_to")} <strong>{t("close")}</strong>{" "}
            {t("the_form?")}
          </div>
        </div>
      </CRXConfirmDialog>
    </div>
  );
};

export default RetentionPoliciesDetail;
