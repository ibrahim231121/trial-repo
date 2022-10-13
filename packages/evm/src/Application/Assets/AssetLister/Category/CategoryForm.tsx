import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CRXButton, CRXAlert } from '@cb/shared';
import { AddToEditFormStateCreator } from '../../../../Redux/CategoryFormSlice';
import DialogueForm from './SubComponents/DialogueForm';
import DisplayCategoryForm from './SubComponents/DisplayCategoryForm';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import { EvidenceAgent } from '../../../../utils/Api/ApiAgent';
import { EvdenceCategoryAssignment } from '../../../../utils/Api/models/EvidenceModels';
import { getAssetSearchInfoAsync } from "../../../../Redux/AssetSearchReducer";
import { CategoryFormProps, SubmitType } from './Model/CategoryFormModel';
import { SearchType } from '../../utils/constants';

const CategoryForm: React.FC<CategoryFormProps> = (props) => {
  const { t } = useTranslation<string>();
  const dispatch = useDispatch();
  const [filteredFormArray, setFilteredFormArray] = React.useState<any[]>([]);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [alert, setAlert] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [saveBtn, setSaveBtn] = React.useState(true);
  const [formFields, setFormFields] = React.useState<any>([]);
  const [InitialValuesObject, setInitialValuesObject] = React.useState<any>({});
  const evidenceResponse = props.evidenceResponse;
  const evidenceId = evidenceResponse?.id;
  const categoryOptions = useSelector((state: any) => state.assetCategory.category);
  const saveBtnClass = saveBtn ? 'nextButton-Edit' : 'primeryBtn';
  const isErrorClx = error && 'onErrorcaseClx';

  React.useEffect(() => {
    props.setModalTitle(t('Category_form'));
    props.setIndicateTxt(false);
    props.setshowSSticky(true)
    props.setremoveClassName('crxEditCategoryForm');
    // Untill save button get enabled, form will be in non updated.
    if (saveBtn) props.setIsformUpdated(false);
  }, []);

  React.useEffect(() => {
    const allCategories = props.filterValue;
    const categoriesFormArr: any[] = [];
    // Check how many categories are added recently,
    const previousAttachedCategories = evidenceResponse?.categories;
    const newSelectedCategories = allCategories.filter((x: any) => {
      if (previousAttachedCategories.length > 0)
        return !previousAttachedCategories.some((o: any) => o.name == x.label);
      else
        return x;
    });

    // If user selected addtional categories, then cross icon click should be a update case.
    if (newSelectedCategories.length > 0) {
      props.setIsformUpdated(true);
      const recentlyAddedCategory = categoryOptions
        .filter((o: any) => {
          return newSelectedCategories.some((e: any) => e.label === o.name);
        })
        .map((i: any) => {
          return {
            id: i.id,
            name: i.name,
            form: i.forms,
            type: 'add'
          };
        });
      categoriesFormArr.push(...recentlyAddedCategory);
    }

    // It means category was attacehd from the backend
    if (previousAttachedCategories.length > 0) {
      props.setModalTitle(t('Edit_category'));
      let changingResponse = evidenceResponse.categories.map((o: any) => {
        return {
          id: o.id,
          name: o.record.record.find((x: any) => x.key === 'Name').value,
          form: o.formData,
          type: 'update'
        };
      });
      categoriesFormArr.push(...changingResponse);
      setFilteredFormArray(categoriesFormArr);

    } else {
      setFilteredFormArray(categoriesFormArr);
    }
  }, [props.filterValue, props.isCategoryEmpty]);

  React.useEffect(() => {
    let Initial_Values: Array<any> = [];
    if (filteredFormArray.length > 0) {
      for (const categoryObj of filteredFormArray) {
        for (const form of categoryObj.form) {
          for (const field of form.fields) {
            if (field.hasOwnProperty('key')) {
              Initial_Values.push({
                key: field.value,
                value: field.value
              });
            } else {
              Initial_Values.push({
                key: field.name,
                value: ''
              });
            }
          }
        }
      }

      let key_value_pair = Initial_Values.reduce((obj, item) => ((obj[item.key] = item.value), obj), {});
      setInitialValuesObject(key_value_pair);
      const initial_values_of_fields = Object.entries(key_value_pair).map((o: any) => {
        return {
          key: o[0],
          value: o[1]
        };
      });
      setFormFields(initial_values_of_fields);
    }
  }, [filteredFormArray]);

  React.useEffect(() => {
    if (formFields.length > 0) {
      // NOTE : Submit Button Disable State, on the basis of Form Input.
      const isFormValidated: boolean = formFields.some((ele: any) => (ele.value.length === 0 || ele.value.length > 1024));
      if (!isFormValidated)
        setSaveBtn(false);
      else
        setSaveBtn(true);
    }
  }, [formFields]);

  React.useEffect(() => {
    const optionalSticky: any = document.getElementsByClassName("optionalSticky")
    if (optionalSticky.length > 0) {
      optionalSticky[0].style.height = "79px"
    } else {
      if (optionalSticky.length > 0) {
        optionalSticky[0].style.height = "119px"
      }
    }
  }, [alert]);

  const setFieldsFunction = (e: any) => {
    const { target } = e;
    let newArray = formFields.filter((o: any) => {
      return o.key !== target.name;
    });
    setFormFields(() => [...newArray, { key: target.name, value: target.value }]);
    props.setIsformUpdated(true);
  };

  const backBtn = () => {
    props.setActiveForm((prev: number) => prev - 1);
  };

  const closeModalFunc = () => {
    props.setOpenForm();
    props.closeModal(false);
  };

  const submitForm = (submitType: SubmitType) => {
    //create object to pass in patch request.
    const categoryBodyArr: any[] = [];
    for (const obj of filteredFormArray) {
      const categoryId = obj.id;
      const categoryFormDataArr: any[] = [];
      if (submitType === SubmitType.WithForm) {
        for (const form of obj.form) {
          const fieldsArray = [];
          for (const field of form.fields) {
            let value: any;
            if (field.hasOwnProperty('key')) {
              value = formFields.filter((x: any) => x.key == field.value).map((i: any) => i.value)[0];
            } else {
              value = formFields.filter((x: any) => x.key == field.name).map((i: any) => i.value)[0];
            }
            const _field = {
              key: field.key === undefined ? field.name : field.key,
              value: value,
              dataType: field.dataType === undefined ? 'FieldTextBoxType' : field.dataType
            };
            fieldsArray.push(_field);
          }

          const _categoryFormbody = {
            formId: form.formId !== undefined ? form.formId : form.id,
            fields: fieldsArray
          };
          categoryFormDataArr.push(_categoryFormbody);
        }
      }
      const _categoryBody = {
        id: categoryId,
        formData: categoryFormDataArr,
        assignedOn: moment().format('YYYY-MM-DDTHH:mm:ss'),
        type: obj.type
      };
      categoryBodyArr.push(_categoryBody);
    }
    const isEditCaseExist = categoryBodyArr.some((e) => e.type === 'update');
    if (isEditCaseExist) {
      dispatch(AddToEditFormStateCreator(categoryBodyArr));
      props.setActiveForm(5);

    } else {
      /**
       * * Remove type key from body.
       * */
      categoryBodyArr.forEach((v: any) => {
        delete v.type;
      });

      const body: EvdenceCategoryAssignment = {
        unAssignCategories: [],
        assignedCategories: categoryBodyArr,
        updateCategories: []
      };

      const url = `/Evidences/${evidenceId}/Categories`;
      EvidenceAgent.changeCategories(url, body).then(() => {
        setSuccess(true);
        setTimeout(() => {
          closeModalFunc();
          dispatch(getAssetSearchInfoAsync({ QUERRY: "", searchType: SearchType.SimpleSearch }));
        }, 3000);
      })
        .catch(() => {
          setError(true);
        });
    }
  }

  return (
    <>
      {success && <CRXAlert message={t("You_have_saved_the_asset_categorization")} alertType='toast' open={true} />}
      {error && (
        <CRXAlert
          className='errorMessageCategory'
          message={t("We_re_sorry._The_form_was_unable_to_be_saved._Please_retry_or_contact_your_Systems_Administrator")}
          type='error'
          alertType='inline'
          open={true}
        />
      )}
      <div className={'indicatestext indicateLessPadding ' + isErrorClx}>
        <b>*</b> {t('Indicates_required_field')}
      </div>
      {filteredFormArray.length > 0 && (
        filteredFormArray.some((o: any) => o.form.length > 0) ? (
          // If form exist against selected category
          <>
            {filteredFormArray.map((categoryObj: any) => (
              <DisplayCategoryForm
                key={categoryObj.id}
                categoryObject={categoryObj}
                isCategoryEmpty={props.isCategoryEmpty}
                initialValueObjects={InitialValuesObject}
                setFieldsFunction={(e: any) => setFieldsFunction(e)}
              />
            ))}
            <div className='categoryModalFooter CRXFooter'>
              <CRXButton onClick={() => submitForm(SubmitType.WithForm)} disabled={saveBtn} className={saveBtnClass + ' ' + 'editButtonSpace'}>
                {' '}
                {props.isCategoryEmpty === false ? t("Next") : t("Save")}
              </CRXButton>
              <CRXButton className='cancelButton secondary' color='secondary' variant='contained' onClick={backBtn}>
                {t("Back")}
              </CRXButton>
              <CRXButton className='skipButton' onClick={() => submitForm(SubmitType.WithoutForm)}>
                {t("Skip_category_form_and_save")}
              </CRXButton>
            </div>
          </>
        ) : (
          // Show dialogue Functionality
          <DialogueForm
            key={"dialogue_form"}
            setActiveForm={props.setActiveForm}
            initialValues={props.filterValue}
            evidenceResponse={evidenceResponse}
            formCollection={filteredFormArray}
            filterValue={props.filterValue}
            setOpenForm={() => props.setOpenForm()}
            closeModal={(v: boolean) => props.closeModal(v)}
            setremoveClassName={(v: any) => props.setremoveClassName(v)}
            setModalTitle={(i: string) => props.setModalTitle(i)}
            setFilterValue={(v: any) => props.setFilterValue(v)}
            setIndicateTxt={(e: any) => props.setIndicateTxt(e)}
          />
        )
      )}
    </>
  );
};

export default CategoryForm;
