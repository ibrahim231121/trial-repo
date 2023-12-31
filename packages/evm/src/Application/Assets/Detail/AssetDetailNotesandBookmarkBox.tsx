import React, { useEffect, useState, useRef } from "react";
import { CRXButton, TextField } from "@cb/shared";
import jwt_decode from "jwt-decode";
import Cookies from 'universal-cookie';
import "./AssetDetailsPanel.scss";
import { CRXTooltip, CRXConfirmDialog } from "@cb/shared";
import { useDispatch } from "react-redux";
import { addTimelineDetailActionCreator } from "../../../Redux/VideoPlayerTimelineDetailReducer";
import { AssetLogType, Bookmark, Note } from "../../../utils/Api/models/EvidenceModels";
import { EvidenceAgent } from "../../../utils/Api/ApiAgent";
import { CMTEntityRecord } from "../../../utils/Api/models/CommonModels";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem } from "@material-ui/core";
import { RootRef } from '@material-ui/core';
import { addAssetLog } from "../../../Redux/AssetLogReducer";
import reactStringReplace from "react-string-replace";

type Timeline = {
  recording_start_point: number;
  recording_Start_point_ratio: number;
  recording_end_point: number;
  recording_end_point_ratio: number;
  recordingratio: number;
  bookmarks: any;
  notes: any;
  startdiff: number;
  video_duration_in_second: number;
  src: string;
  id: string;
  dataId: string;
  unitId: string;
  enableDisplay: boolean,
  indexNumberToDisplay: number,
  camera: string,
  timeOffset: number,
}

interface propsObject {
  stateObj: any
  EvidenceId: any
  timelinedetail: Timeline[]
  selectDropDown: any
  onClickBookmarkNote: any
  toasterMsgRef: any
  saveLogs: any
  searchTerm: string,
  ViewScreen: boolean
}


const AssetDetailNotesandBookmarkBox = ({ stateObj, EvidenceId, timelinedetail, selectDropDown, onClickBookmarkNote, toasterMsgRef, saveLogs, searchTerm, ViewScreen }: propsObject) => {
  const { t } = useTranslation<string>();
  const [description, setDescription] = React.useState<string>("");
  const [editDescription, setEditDescription] = React.useState<boolean>(false);
  const [IsOpenConfirmDailog, setIsOpenConfirmDailog] = React.useState(false);
  const [enableOnSave, setEnableOnSave] = React.useState<boolean>(false);
  const [onSave, setOnSave] = React.useState<boolean>(false);
  const [isReadMore, setIsReadMore] = useState<boolean>(false);
  const [madeByName, setMadeByName] = React.useState<string>("");
  const [editDevice, setEditDevice] = useState(false);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [numberOfLine, setNumberOfLine] = useState<any>("")
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>(stateObj.madeBy);
  const cookies = new Cookies();
  let bookMarkPopup: any = document.querySelector("._video_player_container");

  const userIdBody: CMTEntityRecord = {
    id: "",
    cmtFieldValue: parseInt(localStorage.getItem("User Id") ?? "0"),
    record: [],
  };

  React.useEffect(() => {
    if (!editDescription) {
      let des: any = document.querySelector('textarea')?.getClientRects().length
      if (stateObj.description.length > 127 && !isReadMore) {
        setNumberOfLine(stateObj.description.slice(0, 126));
      }
      else {
        setNumberOfLine(stateObj.description);
      }
      setDescription(stateObj.description);
      setMadeByName(stateObj.madeBy);
    }
  });

  React.useEffect(() => {
    if (stateObj.madeBy == "User") {
      let FName = "";
      let LName = "";
      let listOfKeyValue = stateObj?.userInfo?.record;
      if (listOfKeyValue) { // get case
        if (listOfKeyValue && listOfKeyValue.length > 0) {
          listOfKeyValue.forEach((x: any) => {
            if (x.key == "FName") {
              FName = x.value;
            }
            if (x.key == "LName") {
              LName = x.value;
            }
          });
          setUserName(FName + " " + LName)
        }
      }
      else { // add case
        let accessToken = cookies.get('access_token');
        if (accessToken) {
          let decodedAccessToken: any = jwt_decode(accessToken);
          FName = decodedAccessToken?.FName ? decodedAccessToken?.FName : "";
          LName = decodedAccessToken?.LName ? decodedAccessToken?.LName : "";
          setUserName(FName + " " + LName)
        }
      }
    }
  }, []);


  React.useEffect(() => {
    if (isReadMore && !editDescription) {
      setDescription(stateObj.description);
    }
  }, [isReadMore]);

  let inputRef: any;
  useEffect(() => {
    if (editDescription) {
      // inputRef.focus();
      setIsReadMore(true);
    }
  }, [editDescription]);

  const modalTextSelector = selectDropDown == "Bookmarks" ? "bookmark" : "note";

  const onRemove = (del: boolean) => {
    if (del) {
      let tempData = JSON.parse(JSON.stringify(timelinedetail));
      if (selectDropDown == "Notes") {
        tempData.forEach((x: any) => {
          if (x.dataId == stateObj.assetId) {
            x.notes = x.notes.filter((y: any) => y.id !== stateObj.id);
          }
        })
        dispatch(addTimelineDetailActionCreator(tempData));
      }
      else if (selectDropDown == "Bookmarks") {
        tempData.forEach((x: any) => {
          if (x.dataId == stateObj.assetId) {
            x.bookmarks = x.bookmarks.filter((y: any) => y.id !== stateObj.id);
          }
        })
        dispatch(addTimelineDetailActionCreator(tempData));
      }
    }
  };

  const onClickCancel = () => {
    setEditDescription(false);
    setEnableOnSave(false);
    setIsReadMore(false);
    setEditDevice(false);

  };

  const onChangeDescription = (e: any) => {
    setDescription(e.target.value);
  };


  const onClickEnableEdit = async () => {
    await setIsReadMore(true);
    setEditDescription(true);
    setEnableOnSave(true);
    setEditDevice(true);
    setCustomOpen(false);

  };

  const onUpdateDone = async () => {
    await setIsReadMore(false);
    setEditDescription(false);
    setEnableOnSave(false);
    setEditDevice(false);
  }

  const onClickSave = () => {
    setEditDescription(false);
    setEnableOnSave(false);
    if (selectDropDown == "Bookmarks") {
      onUpdateBookmark();
    } else if (selectDropDown == "Notes") {
      onUpdateNote();
    }
  };

  const onUpdateBookmark = () => {
    const url =
      "/Evidences/" +
      EvidenceId +
      "/Assets/" +
      stateObj.assetId +
      "/Bookmarks/" +
      stateObj.id;
    const body: Bookmark = {
      id: stateObj.id,
      assetId: stateObj.assetId,
      bookmarkTime: stateObj.bookmarkTime,
      position: stateObj.position,
      description: description,
      madeBy: stateObj.madeBy,
      version: stateObj.version,
      user: userIdBody,
    };
    EvidenceAgent.updateBookmark(url, body)
      .then(() => {
        updateBookmarkNoteObjState();
        onUpdateDone();
        toasterMsgRef.current.showToaster({
          message: "Bookmark saved",
          variant: "success",
          duration: 5000,
          clearButtton: true,
        });
        saveLogs(body.assetId, "Bookmark Updated");
      })
      .catch((err: any) => {
        onUpdateDone();
        toasterMsgRef.current.showToaster({
          message: "Bookmark error",
          variant: "error",
          duration: 5000,
          clearButtton: true,
        });
        console.error(err);
      });
  };

  const onUpdateNote = () => {
    const url =
      "/Evidences/" +
      EvidenceId +
      "/Assets/" +
      stateObj.assetId +
      "/Notes/" +
      stateObj.id;

    const body: Note = {
      assetId: stateObj.assetId,
      id: stateObj.id,
      position: stateObj.position,
      description: description,
      version: stateObj.version,
      noteTime: stateObj.noteTime,
      madeBy: stateObj.madeBy,
      user: userIdBody,
    };
    EvidenceAgent.updateNote(url, body)
      .then(() => {
        updateBookmarkNoteObjState();
        onUpdateDone();
        toasterMsgRef.current.showToaster({
          message: "Note saved",
          variant: "success",
          duration: 5000,
          clearButtton: true,
        });
        saveLogs(body.assetId, "Note Updated");
      })
      .catch((err: any) => {
        onUpdateDone();
        toasterMsgRef.current.showToaster({
          message: "Note error",
          variant: "Error",
          duration: 5000,
          clearButtton: true,
        });
        console.error(err);
      });
  };

  const updateBookmarkNoteObjState = () => {
    let tempData = JSON.parse(JSON.stringify(timelinedetail));
    if (selectDropDown == "Notes") {
      tempData.forEach((x: any) => {
        if (x.dataId == stateObj.assetId) {
          x.notes.forEach((y: any) => {
            if (y.id == stateObj.id) {
              y.description = description;
            }
          });
        }
      })
      dispatch(addTimelineDetailActionCreator(tempData));
    }
    else if (selectDropDown == "Bookmarks") {
      tempData.forEach((x: any) => {
        if (x.dataId == stateObj.assetId) {
          x.bookmarks.forEach((y: any) => {
            if (y.id == stateObj.id) {
              y.description = description;
            }
          });
        }
      })
      dispatch(addTimelineDetailActionCreator(tempData));
    }
  };

  const onClickDelete = () => {
    setIsOpenConfirmDailog(true);
    setCustomOpen(false);

  };

  const onDeleteBookmark = () => {
    const url =
      "/Evidences/" +
      EvidenceId +
      "/Assets/" +
      stateObj.assetId +
      "/Bookmarks/" +
      stateObj.id;
    EvidenceAgent.deleteBookmark(url)
      .then(() => {
        onRemove(true);
        toasterMsgRef.current.showToaster({
          message: "Bookmark Sucessfully Deleted",
          variant: "success",
          duration: 5000,
          clearButtton: true,
        });
        setIsOpenConfirmDailog(false);
        saveLogs(stateObj.assetId, "Bookmark Deleted");
      })
      .catch((err: any) => {
        toasterMsgRef.current.showToaster({
          message: "Bookmark Delete Error",
          variant: "error",
          duration: 5000,
          clearButtton: true,
        });
        console.error(err);
      });
  };

  const onDeleteNote = () => {
    const url =
      "/Evidences/" +
      EvidenceId +
      "/Assets/" +
      stateObj.assetId +
      "/Notes/" +
      stateObj.id;
    EvidenceAgent.deleteNote(url)
      .then(() => {
        onRemove(true);
        toasterMsgRef.current.showToaster({
          message: "Note Sucessfully Deleted",
          variant: "success",
          duration: 5000,
          clearButtton: true,
        });
        setIsOpenConfirmDailog(false);
        saveLogs(stateObj.assetId, "Note Deleted");
      })
      .catch((err: any) => {
        toasterMsgRef.current.showToaster({
          message: "Error Deleting Note",
          variant: "error",
          duration: 5000,
          clearButtton: true,
        });
        console.error(err);
      });
  };
  useEffect(() => {
    if (confirmDelete) {
      onDeleteConfirm()

    }
  }, [confirmDelete]);

  const bookMarkPopupFunction = () => {
    bookMarkPopup.classList.add("_asset_detail_view_video_popup");
    setTimeout(() => {
      if(bookMarkPopup){
        bookMarkPopup.classList.remove("_asset_detail_view_video_popup");
      }  
    }, 0.5);
  }

  const onDeleteConfirm = async () => {
    if (IsOpenConfirmDailog) {
      setIsOpenConfirmDailog(false)
      if (selectDropDown == "Bookmarks") {
        onDeleteBookmark();
      
      } else if (selectDropDown == "Notes") {
        onDeleteNote();
      }
      setConfirmDelete(!confirmDelete)
    }
    bookMarkPopupFunction();
  };

  const handleReadMore = () => {
    setIsReadMore(true);
  }
  const handleReadLess = () => {
    setIsReadMore(false);
  }


  const handleClickAction = (event: any) => {
    setAnchorEl(event.currentTarget);

  };

  const handleCloseAction = () => {
    setAnchorEl(null);
  };

  const wrapperRef = useRef(null);

  function useOutsideAlerter(ref: any) {
    useEffect(() => {

      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setCustomOpen(false);

        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {

        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideAlerter(wrapperRef);

  const [customOpen, setCustomOpen] = useState(false);
  const customMenu = () => {
    if (!customOpen) {
      setCustomOpen(true);
    } else {
      setCustomOpen(false);

    }
  }
  const formattedText = (description: string) => {
    let value = description.replace("z", '<b>z</b>')

    return value;
  }

  const OpenConfrimDailogFun = () => {
    setIsOpenConfirmDailog(false)
    bookMarkPopupFunction()
  }


  return (
    <>
      <div className="item_asset_detail_bookmarks">
        <a>

          <div className="_bookmark_time_user_flex">
            <div className="_bookmark_time" onClick={() => selectDropDown == "Notes" ? onClickBookmarkNote(stateObj, 2) : onClickBookmarkNote(stateObj, 1)}>
              {selectDropDown == "Notes" ? moment(stateObj.noteTime).format("HH:MM:SS") : moment(stateObj.bookmarkTime).format("HH:MM:SS")}
            </div>
            <div className={`${editDevice ? "_bookmark_detail_user_box _bookmark_detail_user_box_editabled " : "_bookmark_detail_user_box"}`} onClick={() => { isReadMore ? setIsReadMore(false) : setIsReadMore(true) }}>
              <div className="_bookmark_users">
                {` ${t("From")}: `}<span>{userName}</span>
              </div>
              <div className={`${editDevice ? "textToggler textField_Edited" : "textToggler"} ${isReadMore ? 'displayBlock' : ''}  `}>
                {editDevice ? <TextField
                  type="text"
                  placeholder={"Type your note here"}
                  onChange={(e: any) => onChangeDescription(e)}
                  value={description}
                  multiline
                  rows={!isReadMore && numberOfLine.length >= 80 ? 2 : null}
                  variant={"outlined"}

                  inputRef={(input: any) => {
                    inputRef = input;
                  }}
                  fullWidth
                /> : <div className={isReadMore ? "readMoreClass" : ""}>

                  {reactStringReplace(description, searchTerm, (match, i) => (
                    <span key={i} style={{ fontWeight: 'bolder' }}>{match}</span>
                  ))}

                </div>}

                {!editDescription && stateObj.description.length >= 130 && (numberOfLine.length >= 130 ?
                  <div className="bookmark_read_function" onClick={() => handleReadLess()}><p>{t("Read_less")} </p><i className="fa-regular fa-chevron-up"></i></div>
                  : <div className="bookmark_read_function" onClick={() => handleReadMore()}><p>{t("Read_More")}</p><i className="fa-regular fa-chevron-down"></i></div>)}
                {((selectDropDown == "Bookmarks" && stateObj.madeBy == "User") || selectDropDown == "Notes") && enableOnSave &&
                  <div className="_field_action_container">
                    <CRXButton onClick={onClickCancel}>
                      <CRXTooltip
                        iconName="fa-regular fa-xmark"
                        placement="bottom"
                        title="cancel"
                        arrow={false}
                        className="_field_action_button _action_button_xmark"
                      ></CRXTooltip>
                    </CRXButton>
                    <CRXButton onClick={onClickSave} disabled={description == "" ? true : false}>
                      <CRXTooltip
                        iconName="far fa-check"
                        placement="bottom"
                        title="done"
                        arrow={false}
                        className="_field_action_button"
                      ></CRXTooltip>
                    </CRXButton>

                  </div>
                }
              </div>
            </div>

            <div className="_side_panel_bookmark_menu" onClick={handleClickAction}>
              {stateObj.madeBy == "User" &&
                <>


                  <Button aria-controls="simple-menu" aria-haspopup="true" onClick={customMenu}>
                    <CRXTooltip
                      placement="bottom"
                      iconName="far fa-ellipsis-v"
                      className="bookmarkActionEllipsis"
                      title="actions"
                    />
                  </Button>

                  {customOpen &&
                    <div ref={wrapperRef} className="action_menu_bookmarkNotes">
                      <ul>
                        <li onClick={onClickEnableEdit}><i className="fas fa-pencil"></i>{t("Edit")}</li>
                        {ViewScreen && <li onClick={onClickDelete}><i className="fa-solid fa-trash-can BN_fa-trash"></i>{t("Delete")}</li>}

                      </ul>
                    </div>
                  }
                </>

              }
            </div>
          </div>


        </a>
      </div>
      <CRXConfirmDialog
        setIsOpen={() => OpenConfrimDailogFun()}
        onConfirm={() => setConfirmDelete(true)}
        className="__CRX_BookMarkNote_Delete_Modal__"
        title={t("Please_confirm")}
        isOpen={IsOpenConfirmDailog}
        primary="Yes, delete"
        secondary="No, do not delete"
      >
        {
          <div className="crxUplockContent">
            You are attempting to <strong>delete</strong> the{" "}
            {modalTextSelector}. You will not be able to undo this
            action.
            <p>
              Are you sure you would like to <strong>delete</strong> the{" "}
              {modalTextSelector}?
            </p>
          </div>
        }
      </CRXConfirmDialog>
    </>
  );
};

export default AssetDetailNotesandBookmarkBox;

