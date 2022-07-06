import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CRXModalDialog } from '@cb/shared';
import { CRXButton } from '@cb/shared';
import { CRXAlert } from '@cb/shared';
import { TextField } from '@cb/shared';
import "./VideoPlayer.scss";
import { CRXCheckBox } from '@cb/shared';
import moment from 'moment';
import { CRXConfirmDialog } from '@cb/shared';
import { Asset, Bookmark, File } from '../../utils/Api/models/EvidenceModels';
import { EvidenceAgent } from '../../utils/Api/ApiAgent';

type VideoPlayerSnapshotFormProps = {
    description: string;
    imageString: string;
};

type VideoPlayerSnapshotProps = {
    openBookmarkForm: boolean;
    editBookmarkForm: boolean
    setopenBookmarkForm: any;
    seteditBookmarkForm: any;
    videoHandle: any;
    AssetData: any;
    EvidenceId: any;
    BookmarktimePositon?: number;
    bookmark: any;
    bookmarkAssetId?: number;
    toasterMsgRef: any;
    timelinedetail: any;
    settimelinedetail: any;
};

const VideoPlayerBookmark: React.FC<VideoPlayerSnapshotProps> = React.memo((props) => {
    const {openBookmarkForm,editBookmarkForm,setopenBookmarkForm,seteditBookmarkForm,videoHandle,AssetData,EvidenceId,BookmarktimePositon,bookmark,bookmarkAssetId,toasterMsgRef,timelinedetail,settimelinedetail} = props;
    const [openModal, setOpenModal] = React.useState(false);
    const [IsOpenConfirmDailog, setIsOpenConfirmDailog] = React.useState(false);
    const [removeClassName, setremoveClassName] = React.useState('');
    const [alert, setAlert] = React.useState<boolean>(false);
    const [responseError, setResponseError] = React.useState<string>('');
    const [alertType, setAlertType] = useState<string>('inline');
    const [errorType, setErrorType] = useState<string>('error');
    const alertRef = useRef(null);
    const [onSave, setOnSave] = useState(true);
    const [isSnapshotRequired, setIsSnapshotRequired] = React.useState(false);
    const [descriptionErr, setdescriptionErr] = React.useState("");
    const [isSuccess, setIsSuccess] = React.useState({
        success: false,
        SuccessType: "",
    });
    const [formpayload, setFormPayload] = React.useState<VideoPlayerSnapshotFormProps>({
        description: editBookmarkForm ? bookmark.description:'',
        imageString: '',
    });

    const [bookmarkobj, setbookmarkobj] = React.useState<any>({
        assetId: editBookmarkForm ? bookmarkAssetId : AssetData.dataId,
        bookmarkTime: "",
        createdOn: "",
        modifiedOn: null,
        description: "",
        id: 0,
        madeBy: "",
        position: 0,
        version: ""
    });

    const [formpayloadErr, setFormPayloadErr] = React.useState({
        descriptionErr: '',
        imageStringErr: '',
    });

    React.useEffect(() => {
        setOpenModal(openBookmarkForm)
    }, []);

    React.useEffect(() => {
        if(isSuccess.success){
            var tempData = [...timelinedetail];
            if(isSuccess.SuccessType == "Add"){
                tempData.forEach((x:any)=> 
                            {if(x.dataId == bookmarkobj.assetId){
                                x.bookmarks = [...x.bookmarks, bookmarkobj]
                            }})
                settimelinedetail([...tempData]);
                setIsSuccess({...isSuccess, success: false, SuccessType: ""});
                if(!isSnapshotRequired){
                    setOpenModal(false);
                    setopenBookmarkForm(false);
                }
            }
            else if(isSuccess.SuccessType == "Update"){
                tempData.forEach((x:any)=> 
                            {if(x.dataId == bookmarkobj.assetId){
                                x.bookmarks = x.bookmarks.filter((y:any)=> y.id !== bookmarkobj.id);
                                x.bookmarks = [...x.bookmarks, bookmarkobj];
                            }})
                settimelinedetail([...tempData]);
                setOpenModal(false);
                setopenBookmarkForm(false);
                seteditBookmarkForm(false);
                setIsSuccess({...isSuccess, success: false, SuccessType: ""});
            }
            else if(isSuccess.SuccessType == "Delete"){
                tempData.forEach((x:any)=> 
                            {if(x.dataId == bookmarkobj.assetId){
                                x.bookmarks = x.bookmarks.filter((y:any)=> y.id !== bookmarkobj.id);
                            }})
                settimelinedetail([...tempData]);
                setOpenModal(false);
                setopenBookmarkForm(false);
                seteditBookmarkForm(false);
                setIsSuccess({...isSuccess, success: false, SuccessType: ""});
            }
        }
        
    }, [isSuccess]);

    React.useEffect(() => {
        if (isSnapshotRequired) {
            var w = videoHandle.videoWidth * 0.25;
            var h = videoHandle.videoHeight * 0.25;
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoHandle, 0, 0, w, h);
            }
            setFormPayload({ ...formpayload, imageString: canvas.toDataURL() })
        }
        else {
            setFormPayload({ ...formpayload, imageString: "" });
        }
    }, [isSnapshotRequired]);

    useEffect(() => {
        formpayload.description.length > 0 ? setOnSave(false) : setOnSave(true);
    }, [formpayload.description]);

    const handleClose = (e: React.MouseEvent<HTMLElement>) => {
        setOpenModal(false);
        setopenBookmarkForm(false);
        seteditBookmarkForm(false);
    };

    const onAdd = async () => {
        if(formpayload.description.length > 0){
            await AddBookmark();
        }
        if(isSnapshotRequired){
            await AddSnapshot();
        }
    };

    const AddBookmark = async () => {
        const AssetId = AssetData.dataId;
        const body : Bookmark = {
            id: 0,
            assetId: AssetId,
            bookmarkTime: new Date(),
            position: BookmarktimePositon ?? 0,
            description: formpayload.description,
            madeBy: "User",
            version: ""
        };
        const bookmarkaddurl = "/Evidences/"+EvidenceId+"/Assets/"+AssetId+"/Bookmarks";
        EvidenceAgent.addBookmark(bookmarkaddurl, body).then((response: any) => {
            setbookmarkobj({ ...bookmarkobj, bookmarkTime: body.bookmarkTime, description: body.description, id: response, madeBy: body.madeBy, position: body.position });
            setIsSuccess({...isSuccess, success: true, SuccessType: "Add"});
            toasterMsgRef.current.showToaster({message: "Bookmark Sucessfully Saved", variant: "Success", duration: 5000, clearButtton: true});
        })
        .catch((e:any) =>{
            setAlert(true);
            setResponseError(
                "We're sorry. The form was unable to be saved. Please retry or contact your System Administrator."
            );
            setResponseError(e);
        })
    }

    const AddSnapshot = async () => {
        const formdata = formpayload;
        var guid = uuidv4();
        const AssetFilebody : File = {
            id:0,
            filesId: 0,
            assetId: 0,
            name: "Snapshot_FILE_" + guid,
            type: "Image",
            extension: "jpeg",
            url: "www.hdc.com:8080",
            size: 1280,
            sequence: 0,
            duration: 0,
            checksum: {
                checksum: "bc527343c7ffc103111f3a694b004e2f",
                algorithm: "SHA-256",
                status: true
            },
            recording: {
                started: new Date(),
                ended: new Date(),
                timeOffset: 0
            }
        };
        const Assetbody : Asset = {
            id: 0,
            name: "Snapshot_" + guid,
            typeOfAsset: "Image",
            state: "Normal",
            status: "Queued",
            unitId: AssetData.unitId,
            duration: 0,
            bookMarks: [],
            files: [AssetFilebody],
            owners: [1],
            recording: {
                started: new Date(),
                ended: new Date(),
                timeOffset: 0,
            },
            isRestrictedView: false,
            buffering: {
                pre: 0,
                post: 0
              },
            isOverlaid: false,
            notes: []
        };
        const url = "/Evidences/" + EvidenceId + "/Assets";
        EvidenceAgent.addAsset(url, Assetbody).then(() => {
            toasterMsgRef.current.showToaster({message: "Snapshot Sucessfully Saved", variant: "Success", duration: 5000, clearButtton: true});
            setOpenModal(false);
            setopenBookmarkForm(false);
        })
        .catch((e:any) =>{
            setAlert(true);
            setResponseError(
                "We're sorry. The form was unable to be saved. Please retry or contact your System Administrator."
            );
            setResponseError(e);
        })
    }

    const onUpdate = async () => {
        const url = "/Evidences/"+EvidenceId+"/Assets/"+bookmark.assetId+"/Bookmarks/"+bookmark.id;
        const body : Bookmark = {
            id: bookmark.id,
            assetId: bookmark.assetId,
            bookmarkTime: bookmark.bookmarkTime,
            position: bookmark.position,
            description: formpayload.description,
            madeBy: bookmark.madeBy,
            version: bookmark.version
        };
        EvidenceAgent.updateBookmark(url, body).then(() => {
            setbookmarkobj({ ...bookmarkobj, bookmarkTime: body.bookmarkTime, description: body.description, id: body.id, madeBy: body.madeBy, position: body.position, version: body.version, createdOn: bookmark.createdOn, modifiedOn: bookmark.modifiedOn })
            setIsSuccess({...isSuccess, success: true, SuccessType: "Update"});
            toasterMsgRef.current.showToaster({message: "Bookmark Sucessfully Updated", variant: "Success", duration: 5000, clearButtton: true});        
        })
        .catch((err: any) => {
            setAlert(true);
            setResponseError(
                "We're sorry. The form was unable to be saved. Please retry or contact your System Administrator."
            );
            console.error(err);
        });
    };

    const onDelete = async () => {
        const url = "/Evidences/"+EvidenceId+"/Assets/"+bookmark.assetId+"/Bookmarks/"+bookmark.id;
        EvidenceAgent.deleteBookmark(url).then(() => {
            setbookmarkobj({ ...bookmarkobj, id: bookmark.id })
            setIsSuccess({...isSuccess, success: true, SuccessType: "Delete"})
            toasterMsgRef.current.showToaster({message: "Bookmark Sucessfully Deleted", variant: "Success", duration: 5000, clearButtton: true});
        })
        .catch((err: any) => {
            setAlert(true);
            setResponseError(
                "We're sorry. The form was unable to be saved. Please retry or contact your System Administrator."
            );
            console.error(err);
        });
    };

    const onSubmit = async (e: any) => {
        setResponseError('');
        setAlert(false);
        if(editBookmarkForm){
            await onUpdate()
            if(isSnapshotRequired){
                await AddSnapshot();
            }
        }else{
            await onAdd();
        }
    };

    const onDeleteClick = async () => {
        setIsOpenConfirmDailog(true);
    };
    const onDeleteConfirm = async () => {
        setResponseError('');
        setAlert(false);
        await onDelete();
    };

    const handlesnapshot = (e: any) => {
        setIsSnapshotRequired(e);
    }

    const checkDescription = () => {
        if (!formpayload.description) {
            setdescriptionErr('Description is required');
        }
        else {
            setdescriptionErr('');
        }
    }
    


    return (
        <div className='videoPlayerSnapshot'>
            <CRXConfirmDialog
                setIsOpen={() => setIsOpenConfirmDailog(false)}
                onConfirm={onDeleteConfirm}
                title="Please Confirm"
                isOpen={IsOpenConfirmDailog}
                primary="Yes, Delete"
                secondary="No, Close"
                >
                {
                    <div className="crxUplockContent">
                    You are attempting to <strong>Delete</strong> the{" "}
                    <strong>Bookmark</strong>. If you close the form, any changes
                    you've made will not be saved. You will not be able to undo this
                    action.
                    <p>
                        Are you sure like to <strong>Delete</strong> the Bookmark?
                    </p>
                    </div>
                }
            </CRXConfirmDialog>
            <CRXModalDialog
                maxWidth="gl"
                title="Bookmark"
                className={'CRXModal ___CRXBookMark__' + removeClassName}
                modelOpen={openModal}
                onClose={handleClose}
                defaultButton={false}
                showSticky={false}
            >
                <div className={` ${alert == true ? "__CRXAlertDes__" : ""}`}>
                    <CRXAlert
                        ref={alertRef}
                        message={responseError}
                        className='crxAlertSnapShotEditForm'
                        alertType={alertType}
                        type={errorType}
                        open={alert}
                        setShowSucess={() => null}
                    />
                    <div className="modalEditCrx">
                        <div className='CrxEditForm'>
                            <TextField
                                error={!!descriptionErr}
                                errorMsg={descriptionErr}
                                value={formpayload.description}
                                multiline
                                label='Description'
                                className='description-input'
                                required={true}
                                onChange={(e: any) => setFormPayload({ ...formpayload, description: e.target.value })}
                                onBlur={checkDescription}
                            />
                            <div className='crx-requird-check'>
                                <CRXCheckBox
                                    checked={isSnapshotRequired}
                                    lightMode={true}
                                    className='crxCheckBoxCreate'
                                    onChange={(e: any) => handlesnapshot(e.target.checked)}
                                />
                                <label>Take snapshort</label>
                            </div>
                        </div>
                        <div className='categoryModalFooter CRXFooter'>
                            <CRXButton className='primary' onClick={onSubmit} disabled={onSave}>
                                Save
                            </CRXButton>
                            <CRXButton className='secondary' onClick={handleClose}>
                                Cancel
                            </CRXButton>
                            {editBookmarkForm && <CRXButton className='secondary' onClick={onDeleteClick} style={{ left: "250px"}}>
                                Delete
                            </CRXButton>}
                        </div>
                    </div>
                </div>


            </CRXModalDialog>
        </div>
    );
});

export default VideoPlayerBookmark;