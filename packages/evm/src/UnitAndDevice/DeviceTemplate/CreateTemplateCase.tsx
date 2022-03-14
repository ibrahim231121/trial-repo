import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { CRXTooltip } from '@cb/shared';
import { Select, MenuItem } from '@material-ui/core';
import { CRXButton, CRXConfirmDialog } from '@cb/shared';
import { Label } from '@material-ui/icons';


var re = /[\/]/;

const CustomizedSelectForFormik = (props: any) => {
  const { children, form, field } = props;
  const { name, value } = field;
  const { setFieldValue } = form;

  // React.useEffect(() => {
  //   if(children?.length > 0)
  //   {
  //     console.log(children);
  //     if(name == "unittemplate/station/Select"){
  //       setFieldValue(name, "24");
  //       debugger;
  //     }
  //   }
  // }, [children])
  return (
    <>
      <Select
        name={name}
        value={value}
        onChange={e => {
          setFieldValue(name, e.target.value);
        }}
      >
        {children}
      </Select>
    </>
  );
};

const addObject = (formObj: any, arrayHelpers: any, cameraFeildArrayCounter: any, setCameraFeildArrayCounter: any, applyValidation: any, Initial_Values_obj_RequiredField: any, setInitial_Values_obj_RequiredField: any, values: any, setValues: any, isValid:any, setformSchema:any) => {

  
  var rowId = parseInt(cameraFeildArrayCounter) + 1;
  setCameraFeildArrayCounter(rowId);

  var lastFeildArrayFeilds = formObj.feilds[0];

  const arrayOfObj = Object.entries(Initial_Values_obj_RequiredField).map((e) => ({ key: e[0], value: e[1] }));

  var arr: any[] = []
  lastFeildArrayFeilds.map((x: any) => {
    var splittedKey = x.key.split('_');
    var key = splittedKey[0] + "_" + rowId + "_" + splittedKey[2];
    if (x.validation && x.depends == undefined) {
      arrayOfObj.push({ "key": key, "value": { "type": x.type, "validation": x.validation } });
    }
    arr.push({ ...x, key: key });
  });

  let key_value_pairs = arrayOfObj.reduce(
    (formObj:any, item:any) => ((formObj[item.key] = { type: item.value.type, validation: item.value.validation }), formObj),
    {}
  );
  setInitial_Values_obj_RequiredField(key_value_pairs);

  var valuesKV = arr.reduce(                  // Validations Object
    (obj, item: any) => ({ ...obj, [item.key]: item.value }),
    {}
  );
  setValues({ ...values, ...valuesKV });

  arrayHelpers.push(arr);


  var initialValuesArrayRequiredField: any[] = applyValidation(arrayOfObj)
  var formSchemaTemp = initialValuesArrayRequiredField.reduce(                  // Validations Object
    (obj, item: any) => ({ ...obj, [item.key]: item.value }),
    {}
  );
  setformSchema(formSchemaTemp);
  
};


const removeObject = (removeIndex:number, Initial_Values_obj_RequiredField: any, setInitial_Values_obj_RequiredField:any, values: any, applyValidation: any, setformSchema: any) => {
  var rowToDelete = values["CameraSetup/Camera/FieldArray"]?.feilds[removeIndex];
  const arrayOfObj = Object.entries(Initial_Values_obj_RequiredField).map((e) => ({ key: e[0], value: e[1] }));
  var arrayOfObjUpdated = arrayOfObj.filter((x:any) => !(rowToDelete.some((y:any) => y.key == x.key)));

  let key_value_pairs = arrayOfObjUpdated.reduce(
    (formObj:any, item:any) => ((formObj[item.key] = { type: item.value.type, validation: item.value.validation }), formObj),
    {}
  );
  setInitial_Values_obj_RequiredField(key_value_pairs);
};


const onChange = (e: any, formObj: any, applyValidation: any, Initial_Values_obj_RequiredField: any, setInitial_Values_obj_RequiredField : any, handleChange: any) => {
  handleChange(e);
  if (formObj.validationChangeFeilds !== undefined) {
    let arrayOfObj = Object.entries(Initial_Values_obj_RequiredField).map((e) => ({ key: e[0], value: e[1] }));
    formObj.validationChangeFeilds.filter((x: any) => x.value == e.target.value)?.map((x: any) => {
      
      var splittedKey = x.key.split('_');
      var parentSplittedKey = formObj.key.split('_');
      var newKey = splittedKey[0] + "_" + parentSplittedKey[1] + "_" + splittedKey[2];
      if (x.todo == "add") {
        if (x.validation) {
          arrayOfObj.push({ "key": newKey, "value": { "type": x.type, "validation": x.validation } });
        }
      }
      else if (x.todo == "remove") {
        arrayOfObj = arrayOfObj.filter((x: any) => x.key !== newKey);
      }
    })

    let key_value_pairs = arrayOfObj.reduce(
      (formObj:any, item:any) => ((formObj[item.key] = { type: item.value.type, validation: item.value.validation }), formObj),
      {}
    );
    setInitial_Values_obj_RequiredField(key_value_pairs);
  }
}

const optionAppendOnChange = (e: any, formObj: any, values: any, setValues: any, handleChange: any, FormSchema: any, index : any) => {
  if (formObj.optionAppendOnChange !== undefined) {
    values[formObj.key] = e;
    var parentSplittedKey = formObj.key.split('_');
    formObj.optionAppendOnChange?.filter((x: any) => x.value == e)?.map((x: any) => {
      var splittedKey = x.selectKey.split('_');
      if (splittedKey.length > 0) {
        var key = splittedKey[0] + "_" + parentSplittedKey[1] + "_" + splittedKey[2];
        var select = values["CameraSetup/Camera/FieldArray"]
          ?.feilds[index]
          .find((feild: any) => feild.key == key);

        if (x.options.includes("all")) {
          select.options.filter((y: any) => y.hidden == true).map((y: any) => {
            y.hidden = false;
          })
        }
        else if (x.options.length > 0) {
          select.options.map((y: any) => {
            if (!x.options.includes(y.value)) {
              y.hidden = true;
            }
          })
        }
      }
    });
    setValues(values);
  }
}







let customEvent = (event: any, y: any, z: any) => {
  if (event.target[z.inputType] === z.if) {
    y(z.field, z.value)
  }

}




export const CreateTempelateCase = (props: any) => {

  const { formObj, values, setValues, index, handleChange, setFieldValue, cameraFeildArrayCounter, setCameraFeildArrayCounter, applyValidation, Initial_Values_obj_RequiredField, setInitial_Values_obj_RequiredField, FormSchema, isValid, setformSchema, touched, errors} = props;

  const handleRowIdDependency = (key: string) => {
    var parentSplittedKey = formObj.key.split('_');
    key = key.replace("rowId", parentSplittedKey[1])
    var value = values[key]
    return value;
  }

  const [open, setOpen] = React.useState(false);
  const [removeIndex, setRemoveIndex] = React.useState(0);



  React.useEffect(() => {
    if (formObj.optionAppendOnChange !== undefined) {
      optionAppendOnChange(formObj.value, formObj, values, setValues, handleChange, FormSchema, index);
    }
  }, []);

 


  switch (formObj.type) {
    case "text":
      return (
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) && 
        <>
        {(formObj.labelGroupRecording) && <span className="MainHeadingDevices"><span className="MainHeadingDevices"><h1 className={'formMainHeading '+formObj.labelGroupRecording}>{formObj.labelGroupRecording}</h1></span></span>}
        <div className={touched[formObj.key] == true && errors[formObj.key]? " textFieldError" : "textField"} >
          <div className="UiLabelTextbox " >
          <div>
          <label className="labelRadioo">{formObj.label}
          <label>
            {formObj.validation?.some((x: any) => x.key == 'required')=== true ? <span className={touched[formObj.key] == true && errors[formObj.key] ? "textBoxRed" : "textBoxBlack"}>*</span> : null}
          </label>
          </label>
          <div className="UiLabelTextboxRight">
          <Field
            name={formObj.key}
            id={formObj.id}
            type={formObj.type}
          />
              <ErrorMessage
                name={formObj.key}
                render={(msg) => (
                <div className="UiLabelTextboxError">
               <i className="fas fa-exclamation-circle"></i>  {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
                </div>
                )}
                />
          </div>


          {formObj.hinttext == true ? (
            <CRXTooltip
            className="CRXTooltip_form"
            iconName="fas fa-info-circle"
            title={formObj.hintvalue}
            placement="right"
          />
          ) : null}
          </div>
        </div>
        </div>
        <div className="UiColumnSpacer"></div>
        </>
      );
    case "time":
      return (
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <div
          style={{
            display: "block",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          <label style={{
            display: "block",
            marginBottom: "10px",
            marginTop: "10px",
          }}>{formObj.labelMute}</label>
          <label>{formObj.label}</label>
          <label>
            {formObj.validation?.some((x: any) => x.key == 'required') === true ? "*" : null}
          </label>
          <Field
            name={formObj.key}
            id={formObj.id}
            type={"time"}
          />
          {formObj.hinttext == true ? (
            <CRXTooltip
              iconName="fas fa-info-circle"
              title={formObj.hintvalue}
              placement="right"
            />
          ) : null}
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div style={{ color: "red" }}>
                {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
              </div>
            )}
          />
        </div>
      );
    case "radio":
      return (
        <>
        {
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <>
        {(formObj.labelGroupRecording) && <h1 className={'formMainHeading '+formObj.labelGroupRecording} >{formObj.labelGroupRecording}</h1>}
        <div className={formObj.class}>
        <div className="UiRadioMain">
        <div className="UiRadioLabel">
              <label >{formObj.labelMute}</label>
        </div>
        <div
          className="UiRadioCheck"
          >
          <div className="Enabled">
          <label className="containerRadio">
          <Field
            id={formObj.id}
            type={formObj.type}
            name={formObj.key}
            value={formObj.value}
            onChange={(e: any) => onChange(e, formObj, applyValidation, Initial_Values_obj_RequiredField, setInitial_Values_obj_RequiredField, handleChange)}
          />
          <span className="checkmarkRadio"></span>
          </label>
          <label className={formObj.label+"Text"}>{formObj.label}
                                                <label>
                                                {formObj.validation?.some((x: any) => x.key == 'required')=== true ? "*" : null}
                                                </label>
                                           <p className="labelMutedText"> {formObj.labelMutedText} </p>

                                            </label>

                                            {formObj.hinttext == true ? (
                                              <CRXTooltip
                                                iconName="fas fa-info-circle"
                                                title={formObj.hintvalue}
                                                placement="right"
                                              />
                                            ) : null}
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div style={{ color: "red" }}>
                {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
              </div>
            )}
          />
          </div>
          </div>
        </div>
        </div>
        <div className="UiColumnRadioSpacer"></div>
        </>
        }
        </>
      );
    case "select":
      return (
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <>
        {(formObj.labelGroupRecording) && <span className="MainHeadingDevices"><span className="MainHeadingDevices"><h1 className={'formMainHeading '+formObj.labelGroupRecording}>{formObj.labelGroupRecording}</h1></span></span>}
        <div
          className={ formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key))) ? `UiStationSelect UiStationSelectDepended` : ' UiStationSelect'}
        >
          <div>
        <label>{formObj.label}    
        <label>
        {formObj.validation?.some((x: any) => x.key == 'required') === true ? "*" : null}
        </label></label>
        <div className="UicustomMulti">
          <Field
            name={formObj.key}
            id={formObj.id}
            // component={CustomizedSelectForFormik}
            component={"select"}
            onChange={(e: any) => formObj.optionAppendOnChange !== undefined ? optionAppendOnChange(e.target.value, formObj, values, setValues, handleChange, FormSchema, index) : handleChange(e)}

          >
            {formObj.options.filter((x: any) => x.hidden != true).map(
              (opt: any, key: string) => (
                // <MenuItem
                //   value={opt.value}
                //   key={key}
                // >{opt.label}{" "}</MenuItem>

                <option
                  style={{ width: "50%" }}
                  value={opt.value}
                  key={key}
                  selected={true}
                >
                  {opt.label}{" "}
                </option>
              )
            )}
          </Field>
          <i className="fas fa-sort-down"></i>
          </div>
          {formObj.hinttext == true ? (
            <CRXTooltip
              iconName="fas fa-info-circle"
              title={formObj.hintvalue}
              placement="right"
            />
          ) : null}
          </div>
          <div>
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div style={{ color: "red" }}>
                {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
              </div>
            )}
          />
          </div>
        </div>
        <div className="UiColumnSpacer"></div>
        </>
      );
    case "multiselect":

      return (
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <div
          style={{
            display: "block",
            marginBottom: "10px",
            marginTop: "10px",
          }}
        >
          <label>{formObj.label}</label>
          <label>
            {formObj.validation?.some((x: any) => x.key == 'required') === true ? "*" : null}
          </label>

          <Field
            name={formObj.key}
            id={formObj.id}
            component={"select"}
            multiple={true}
          >
            {formObj.options.map(
              (opt: any, key: string) => (
                <option
                  style={{ width: "50%" }}
                  value={opt.value}
                  key={key}
                >
                  {opt.label}{" "}
                </option>
              )
            )}
          </Field>
          {formObj.hinttext == true ? (
            <CRXTooltip
              iconName="fas fa-info-circle"
              title={formObj.hintvalue}
              placement="right"
            />
          ) : null}
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div style={{ color: "red" }}>
                {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
              </div>
            )}
          />
        </div>
      );
    case "checkbox":
      console.log(formObj)
      return (
        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <>
        {(formObj.labelGroupRecording) && <span className="MainHeadingDevices"><span className="MainHeadingDevices"><h1 className={'formMainHeading '+formObj.labelGroupRecording}>{formObj.labelGroupRecording}</h1></span></span>}
        <div className={formObj.class}>
        <div
          className={formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key))) ? 'UiCheckbox UiCheckboxDepend ' : 'UiCheckbox' }
          >
          <div  className="UiCheckboxMain">
          <div className="UiCheckboxLeft">
                <label className={formObj.label ? "labelAdded" : "labelNotAdded"}>{formObj.label}
                <label>
                {formObj.validation?.some((x: any) => x.key == 'required') === true ? "*" : null}
                </label>
                </label>
            </div>
            <div className="UiCheckboxRight">
              <div className="UiCheckboxRightPosition">
              <label className="containerCheck" >
          <Field
            name={formObj.key}
            id={formObj.id}
            type={formObj.type}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(event);
              if (formObj.dependant != null) {

                customEvent(event, setFieldValue, formObj.dependant);
              }

            }}
            validateOnChange
          />
              <span className="checkmark" ></span>
    <p className="checkHelperText">{formObj.checkHelperText}</p>
          </label>
          <div>{formObj.checkBoxText ? <p>{formObj.checkBoxText}</p> : ''}</div>
          {formObj.hinttext == true ? (
            <CRXTooltip
              iconName="fas fa-info-circle"
              title={formObj.hintvalue}
              placement="right"
            />
          ) : null}
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div style={{ color: "red" }}>
                {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
              </div>
            )}
          />
          </div>
          </div>
          </div>
          </div>
          <div className={'UiColumnSpacerCheckBox' }></div>
        </div>
        </>
      );
    case "number":
      return (

        (formObj.depends == null || formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key)))) &&
        <div className={formObj.class}>
        <div className={touched[formObj.key] == true && errors[formObj.key]? " NumberFieldError" : "NumberField"}>
        <div className={formObj.depends?.every((x: any) => x.value.includes(handleRowIdDependency(x.key))) ? 'UiNumberSelectorDepend' : ''}>
        <div
        className={`${formObj.seconds === false ? "UiNumberSelector UiNumberSelectorMinute" : "UiNumberSelector"}`}

        >
           {(formObj.labelGroupRecording) && <h1 className={'formMainHeading '+ formObj.labelGroupRecording }>{formObj.labelGroupRecording}</h1>}
           <div className= {formObj.checkHelperText ? 'UiNumberSelectorMain checkHelperTextMain ' : 'UiNumberSelectorMain'}>
           <div className="UiNumberSelectorLeft ">
           <label>{formObj.label}
                                        <label>
                                        {formObj.validation?.some((x: any) => x.key == 'required')=== true  ? <span className={touched[formObj.key] == true && errors[formObj.key] ? "starikRed" :  "starikBlack" }>*</span> : null}
                                        </label>
                                        </label>
            </div>
            <div className={` ${formObj.hinttext === true ? 'UiNumberSelectorRight ' : "UiNumberSelectorRight UiNumberSelectorNoHint" }`}>
          <Field
            name={formObj.key}
            id={formObj.id}
            type={formObj.type}
          />
          <label className="timeShow">
            {formObj.seconds === true
              ? "seconds"
              : "minutes"}
          </label>
          <p className="checkSelectorText">{formObj.checkHelperText}</p>
          {formObj.hinttext == true ? (
            <CRXTooltip
              iconName="fas fa-info-circle"
              title={formObj.hintvalue}
              placement="right"
            />
          ) : null}
          <ErrorMessage
            name={formObj.key}
            render={(msg) => (
              <div className={formObj.checkHelperText ? `UiNumberSelectorError checkHelperTextPresent ` : `UiNumberSelectorError`}>
                <i className="fas fa-exclamation-circle"></i> {formObj.key.split(re)[1].split('_')[0] + " is " + msg}
                
              </div>
            )}
          />
          </div>
          </div>
          <div className="UiColumnSpacer"></div>
        </div>
        </div>
        </div>
        </div>
      );

    case "fieldarray":
      return (
        <FieldArray
          name={formObj.key + ".feilds"}
          render={arrayHelpers => (
            // <></>
            <div>
              {
                values[formObj.key]?.feilds && values[formObj.key]?.feilds.length > 0 ? (
                  values[formObj.key]?.feilds.map((feildArray: any, index: any) => (


                    feildArray.map((feild: any, key: any) => (

                      key == 0 ?
                        <>
                          <h1>Camera {(index + 1)}</h1>
                         <i className="fas fa-minus-circle" onClick={() => { setOpen(true); setRemoveIndex(index) }}></i>


                          <div key={formObj.key + "_DIV" + key}>
                            <CreateTempelateCase formObj={feild} values={values} setValues={setValues} index={index} handleChange={handleChange} setFieldValue={setFieldValue} applyValidation={applyValidation} Initial_Values_obj_RequiredField={Initial_Values_obj_RequiredField} setInitial_Values_obj_RequiredField={setInitial_Values_obj_RequiredField} FormSchema={FormSchema} cameraFeildArrayCounter={cameraFeildArrayCounter} setCameraFeildArrayCounter={setCameraFeildArrayCounter} isValid={isValid} setformSchema={setformSchema} touched={touched} errors={errors} />
                          </div></> :
                        <div key={formObj.key + "_DIV" + key}>
                            <CreateTempelateCase formObj={feild} values={values} setValues={setValues} index={index} handleChange={handleChange} setFieldValue={setFieldValue} applyValidation={applyValidation} Initial_Values_obj_RequiredField={Initial_Values_obj_RequiredField} setInitial_Values_obj_RequiredField={setInitial_Values_obj_RequiredField} FormSchema={FormSchema} cameraFeildArrayCounter={cameraFeildArrayCounter} setCameraFeildArrayCounter={setCameraFeildArrayCounter} isValid={isValid} setformSchema={setformSchema} touched={touched} errors={errors} />

                        </div>
                    ))



                  ))
                ) : (<></>)}

              <CRXButton  onClick={() => addObject(formObj, arrayHelpers, cameraFeildArrayCounter, setCameraFeildArrayCounter, applyValidation, Initial_Values_obj_RequiredField, setInitial_Values_obj_RequiredField, values, setValues, isValid, setformSchema)}>
                + Add camera
              </CRXButton>


              <CRXConfirmDialog
                setIsOpen={(e: React.MouseEvent<HTMLElement>) => { setOpen(false); }}
                onConfirm={() => { setOpen(false); removeObject(removeIndex, Initial_Values_obj_RequiredField, setInitial_Values_obj_RequiredField, values, applyValidation, setformSchema ); arrayHelpers.remove(removeIndex); }}
                title="Please Confirm"
                isOpen={open}
                modelOpen={open}
                primary="remove"
                secondary="cancel"
              >
                {
                  <div className="crxUplockContent">
                    You are attempting to <strong>remove</strong>
                    <strong>Camera</strong>. If you remove this camera, any changes
                    you've made will not be saved. You will not be able to undo this
                    action.
                    <p>
                      Are you sure you would like to <strong>remove</strong> this camera?
                    </p>
                  </div>
                }
              </CRXConfirmDialog>
            </div>

          )}
        />
      );

  }

}
