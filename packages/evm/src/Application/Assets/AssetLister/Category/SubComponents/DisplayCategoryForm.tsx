import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { CRXHeading } from "@cb/shared";
import { useTranslation } from "react-i18next";
import { DisplayCategoryFormProps } from "../Model/DisplayCategoryForm";
import { FieldTypes } from "../Model/FieldTypes";
import { FieldCheckedBoxListType, FieldCheckedBoxType, FieldDropDownListType, FieldRadioButtonListType } from "./FieldTypes/Index";
import { IsFieldtypeEquals } from "../Utility/UtilityFunctions";
import "./DisplayCategoryForm.scss";

const DisplayCategoryForm: React.FC<DisplayCategoryFormProps> = (props) => {
  const { t } = useTranslation<string>();
  return (
    <>
      {(Object.keys(props.initialValueObjects).length > 0) &&
        props.formCollection.map((categoryObject: any) => (
          categoryObject.form.map((formObj: any) => (
            <div className="categoryFormAdded" key={formObj.formId}>
              <CRXHeading variant="h4" className="categoryFormTitle">
                {t("Category_Forms")}{" "}
                {formObj.record !== undefined
                  ? formObj.record.record.find((x: any) => x.key === "Name").value
                  : formObj.name}
              </CRXHeading>
              <Formik
                enableReinitialize={true}
                initialValues={props.initialValueObjects}
                onSubmit={() => { }}
                validationSchema={Yup.object({
                  ...props.validationSchema,
                })}>
                {({ errors,touched }) => (
                  <Form>
                    {formObj.fields.map((field: any) => (
                      <div className={`categoryInnerField `} key={field.id}>
                        <div className="categoryFormLabel_UI">
                            <label className="categoryFormLabel  " htmlFor={field.id}>
                              {field?.display?.caption}
                            </label>
                            <div className={errors[field.name ?? field.key] && touched[field.name ?? field.key] ? "errorStaric" : "formStaric"}>*</div>
                        </div>
                       
                        <div className="CBX-input">
                          {(IsFieldtypeEquals(field, FieldTypes.FieldTextBoxType) || IsFieldtypeEquals(field, FieldTypes.CaseNO) || IsFieldtypeEquals(field, FieldTypes.PolygraphLogNumber) || IsFieldtypeEquals(field, FieldTypes.CADID) || IsFieldtypeEquals(field, FieldTypes.Unknown)) &&
                            <Field
                              className={
                                `editCategoryField ${errors[field.name ?? field.key] && touched[field.name ?? field.key]  ? 'errorBrdr' : ''}`
                              }
                              id={field.id}
                              name={
                                field.name ?? field.key
                              }
                              onKeyUp={(e: any) => {
                                props.setFieldsFunction({ name: e.target.name, value: e.target.value });
                              }}
                            />
                          }
                          {(IsFieldtypeEquals(field, FieldTypes.FieldDropDownListType)) &&
                                  <div  className="categoryFormDropDown_UI">
                                  <Field
                                      id={field.id}
                                      name={
                                        field.name ?? field.key
                                      }
                                      component={(formikProps: any) =>
                                        <FieldDropDownListType
                                          formikProps={formikProps}
                                          options={field.defaultFieldValue.split('|')}
                                          setFieldsFunction={(e) => { props.setFieldsFunction({ name: e.name, value: e.value }); }}
                                        />
                                      }
                                    />
                                  </div>
                        
                          }
                          {(IsFieldtypeEquals(field, FieldTypes.FieldCheckedBoxType)) &&
                            <Field
                              id={field.id}
                              name={
                                field.name ?? field.key
                              }
                              component={(formikProps: any) =>
                                <FieldCheckedBoxType
                                  formikProps={formikProps}
                                  setFieldsFunction={(e) => props.setFieldsFunction({ name: e.name, value: e.value })}
                                />
                              }
                            />
                          }
                          {(IsFieldtypeEquals(field, FieldTypes.FieldTextAreaType)) &&
                            <Field
                              as="textarea"
                              className={
                                `editCategoryField ${errors[field.name ?? field.key] ? 'errorBrdr' : ''}`
                              }
                              id={field.id}
                              name={
                                field.name ?? field.key
                              }
                              onKeyUp={(e: any) => {
                                props.setFieldsFunction({ name: e.target.name, value: e.target.value });
                              }}
                            />
                          }
                          {(IsFieldtypeEquals(field, FieldTypes.FieldCheckedBoxListType)) &&
                            <Field
                              id={field.id}
                              name={
                                field.name ?? field.key
                              }
                              component={(formikProps: any) =>
                                <FieldCheckedBoxListType
                                  formikProps={formikProps}
                                  options={field.defaultFieldValue.split('|')}
                                  setFieldsFunction={(e) => props.setFieldsFunction({ name: e.name, value: e.value })}
                                />
                              }
                            />
                          }
                          {(IsFieldtypeEquals(field, FieldTypes.FieldRadioButtonListType)) &&
                            <Field
                              id={field.id}
                              name={
                                field.name ?? field.key
                              }
                              component={(formikProps: any) =>
                                <FieldRadioButtonListType
                                  formikProps={formikProps}
                                  options={field.defaultFieldValue.split('|')}
                                  setFieldsFunction={(e) => props.setFieldsFunction({ name: e.name, value: e.value })}
                                />
                              }
                            />
                          }
                          {errors[field.name ?? field.key] && touched[field.name ?? field.key] &&(
                            <div className="errorStyle">
                              <i className="fas fa-exclamation-circle"></i>
                              {errors[field.name ?? field.key]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </Form>
                )}
              </Formik>
            </div>
          ))
        ))
      }
    </>
  );
}

export default DisplayCategoryForm;