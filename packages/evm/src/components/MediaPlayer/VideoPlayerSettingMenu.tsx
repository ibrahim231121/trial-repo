import { useEffect, useRef, useState } from 'react'
import MaterialMenu from "@material-ui/core/Menu";
import MaterialMenuItem from "@material-ui/core/MenuItem";
import { CRXButton, CRXCheckBox,CBXSwitcher } from "@cb/shared";
import { FormControlLabel, Switch } from "@material-ui/core";
import "./VideoPlayerSettingMenu.scss";
const VideoPlayerSettingMenu = (props: any) => {

  const {  fullScreenControl, singleVideoLoad, multiTimelineEnabled, setMultiTimelineEnabled, settingMenuEnabled, setSettingMenuEnabled, overlayEnabled, setOverlayEnabled, overlayCheckedItems, setOverlayCheckedItems, isMultiViewEnable, setIsAudioGraph, setIsAudioGraphAnimate, notesEnabled, setnotesEnabled, ViewScreen, isGuestView,settingRef } = props;
  const [overlayMenuEnabled, setOverlayMenuEnabled] = useState<any>(null);
  const [position, setPosition] = useState(false);
  const [annotationsEnabled, setannotationsEnabled] = useState(false);
  const [isAudioGraphEnabled, setIsAudioGraphEnabled] = useState<boolean>(false);
  const [isOverLayAllSelected, setIsOverLayAllSelected] = useState<boolean>(false);
  const OverlayItems = ['Timestamp', 'Sensors', 'GPS (location + speed)', 'Speed'];
  const OverlayItemsMultiViewEnable = ['Timestamp', 'Sensors'];

  const EnableMultipleTimeline = (event: any) => {
    setMultiTimelineEnabled(event.target.checked)
    
    // let scroll:any = window.scroll({
    //   top: 100,
    //   left: 0,
    //   behavior: 'smooth',
    // })
    // let htmlScroll = document.querySelector("html");
    // htmlScroll && (htmlScroll.style.overflowY = "hidden")
    // event.target.checked && scroll();
  }

  if(multiTimelineEnabled) {
    document.documentElement.style.overflow = "hidden";
  }

  const IsShowAudioGraphChangeEvent = (event : any) => {
    
    setIsAudioGraphEnabled(event.target.checked)
    setIsAudioGraph(event.target.checked)
    setIsAudioGraphAnimate(event.target.checked)
    
  }
  const OverlayChangeEvent = (event: any) => {
    if (event.target.checked) {
      setOverlayMenuEnabled(event.currentTarget)
      setPosition(true);
    } else {
      setPosition(false);
    }
    setOverlayEnabled(event.target.checked);
    setSettingMenuEnabled(null)
  }
 

  const notes = (e: any) => {
    if (e.target.checked) {
      setnotesEnabled(true);
    } else {
      setnotesEnabled(false);
    }
  }
  const Annotations = (e: any) => {
    if (e.target.checked) {
      setannotationsEnabled(true);
    } else {
      setannotationsEnabled(false);
    }
  }

  useEffect(() => {
    if(Boolean(settingMenuEnabled) || Boolean(overlayMenuEnabled)) {
      document.querySelector(".faCogIcon")?.classList.add("faCogIconScale");
    } else {
      document.querySelector(".faCogIcon")?.classList.remove("faCogIconScale");
    }
  })

  let CheckedSensors = overlayCheckedItems.some((x: any) => x == "Sensors");
  let CheckedAll = isOverLayAllSelected;
  let CheckedTimestamp = overlayCheckedItems.some((x: any) => x == "Timestamp");
  let CheckedGPS = isMultiViewEnable ?  false : overlayCheckedItems.some((x: any) => x == "GPS (location + speed)")
  let CheckedSpeed = isMultiViewEnable ?  false : overlayCheckedItems.some((x: any) => x == "Speed")

  useEffect(()=>{
    let url = window.location.href;
    let validString = url.split('/');
    let guestView = false;
    if(validString[4]) {
        let validEndPoint = validString[4].split('?');
        if(validEndPoint[0] == "SharedMedia")
        {
          guestView = true;
        }
    }
      if(settingMenuEnabled === null) {  
        document.documentElement.style.overflow = guestView == true ? "clip":"hidden";
        document.body.scrollTop = 0; 
        document.documentElement.scrollTop = 0;
      } else if (isAudioGraphEnabled && multiTimelineEnabled  ) {
        document.documentElement.style.overflow = guestView == true ? "scroll":"hidden";
      } else if(multiTimelineEnabled) {
        document.documentElement.style.overflow = guestView == true ? "scroll":"hidden";
      } else if( isAudioGraphEnabled && !multiTimelineEnabled) {
        document.documentElement.style.overflow = guestView == true ? "scroll":"hidden";
      } else {
        document.documentElement.style.overflow = guestView == true ? "clip":"hidden";
        document.body.scrollTop = 0; 
        document.documentElement.scrollTop = 0;
      }
  },[settingMenuEnabled,isAudioGraphEnabled,multiTimelineEnabled])

  const settingEnabled_status = !singleVideoLoad && isMultiViewEnable ? "settingEnabled_on" : "settingEnabled_off";
  const notesEnabledClass = notesEnabled ? "notesEnabled_On" : "notesEnabled_Off";
  const onCheckedAll = (value: any) => {
    if(value){
      setIsOverLayAllSelected(value)
      setOverlayCheckedItems(!isMultiViewEnable ? OverlayItems : OverlayItemsMultiViewEnable)
    }
    else{
      setIsOverLayAllSelected(value)
      setOverlayCheckedItems([])
    }
  }

  useEffect(()=>{
    if(!isMultiViewEnable ? overlayCheckedItems.length == OverlayItems.length : overlayCheckedItems.length == OverlayItemsMultiViewEnable.length){
      setIsOverLayAllSelected(true)
    }
    else{
      setIsOverLayAllSelected(false)
    }
  },[overlayCheckedItems])
  
  return (
    <>
    <MaterialMenu
        className={`ViewScreenMenu   ${position === true ? "settingOverlayPos" : ""}   ${multiTimelineEnabled ? "enabledMultiLine" : "disenabledMultiLine"}  ${position === true && multiTimelineEnabled == true ? " settingMultiOverlay" : ""} ${!singleVideoLoad && isMultiViewEnable ? "MultiVideoMenu" : "SettingOverlayMenu"} ${overlayEnabled ? "overlayEnabledPosition" : ""}  ${fullScreenControl}  ${settingEnabled_status} ${notesEnabledClass}`}
        anchorEl={settingMenuEnabled}
        keepMounted
        open={Boolean(settingMenuEnabled)}
        onClose={() => { setSettingMenuEnabled(null) }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        container={settingRef.current}
      >
        

        {!isGuestView && <MaterialMenuItem className={`settingOverlay`}>
          <span className="icon icon-pencil5 iconsLeft"></span>

          <div className="SwitcherControl"  >
            <label>
              <span>Annotations</span>
              <CBXSwitcher className="videoSetingMenu_toggle_button" rootClass="videoSetingMenu_toggle" toggleLabel={false} theme="dark" checked={annotationsEnabled} size="small" onChange={(e: any) => Annotations(e)} name="Annotations" />
            </label>
          </div>
        </MaterialMenuItem>}

        {!isGuestView && ViewScreen && <MaterialMenuItem className="settingOverlay">
          <span className='fas fa-comment-alt-plus iconsLeft'></span>

          <div className="SwitcherControl"  >
            <label>
              <span>Notes</span>
              <CBXSwitcher rootClass="videoSetingMenu_toggle" toggleLabel={false} theme="dark" checked={notesEnabled} size="small" onChange={(e: any) => notes(e)} name="Notes" />
            </label>
          </div>
        </MaterialMenuItem>}
        {!isGuestView && <MaterialMenuItem className="settingOverlay">
          <span className="fa-solid fa-chart-simple iconsLeft"></span>
          {/* <span className="toggleBack"></span> */}
          <div className="SwitcherControl"  >
            <label>
              <span>Audio Graph</span>
              <CBXSwitcher rootClass="videoSetingMenu_toggle" toggleLabel={false} theme="dark" checked={isAudioGraphEnabled} size="small" onChange={(event: any) => IsShowAudioGraphChangeEvent(event)} name="audioGraph" />
            </label>
          </div>
          {/* <i className="fas fa-chevron-right iconsRight"></i> */}
        </MaterialMenuItem>}
        {!isGuestView && <MaterialMenuItem className="settingOverlay">
          <span className="icon icon-stack3 iconsLeft"></span>
          <span className="toggleBack"></span>
          <div className="SwitcherControl"  >
            <label>
              <span>Overlay</span>
              <CBXSwitcher rootClass="videoSetingMenu_toggle" toggleLabel={false} theme="dark" checked={overlayEnabled} size="small" onChange={(event: any) => OverlayChangeEvent(event)} name="Overlay" />
            </label>
          </div>
          <i className="fas fa-chevron-right iconsRight" ></i>
        </MaterialMenuItem>}
        {(!isGuestView && !singleVideoLoad && isMultiViewEnable && ViewScreen) &&
          <>
            <MaterialMenuItem className="settingOverlay">
              <i className="far fa-stream iconsLeft"></i>
              <div className="SwitcherControl"  >
                <label>
                  <span>Multiple Timelines</span>
                  <CBXSwitcher rootClass="videoSetingMenu_toggle" toggleLabel={false} theme="dark" checked={multiTimelineEnabled} size="small" onChange={(event: any) => EnableMultipleTimeline(event)} name="Multiple Timelines" />
                </label>
              </div>
            </MaterialMenuItem>
          </>
        }

      </MaterialMenu>


      <MaterialMenu
        className={`ViewScreenMenu SettingBackMenu settingBack_${notesEnabledClass} ${position === true && multiTimelineEnabled == true ? "backOverlayTab" : ""} ${CheckedAll ? "CheckedAllTrueMain" : ""} ${ !singleVideoLoad  ? "MultiBackMenu" : ""} ${fullScreenControl} ` }
        anchorEl={overlayMenuEnabled}
        keepMounted
        open={Boolean(overlayMenuEnabled)}
        onClose={() => { overlayMenuEnabled(null) }}
        container={settingRef.current}
      >
        <MaterialMenuItem className='backChevron'>
          <i className="fas fa-chevron-left chevronLeft "></i>
          <CRXButton color="primary" onClick={(e: any) => { setSettingMenuEnabled(e.currentTarget); setOverlayMenuEnabled(null) }}>Back</CRXButton>
        </MaterialMenuItem>
        <MaterialMenuItem className={`${CheckedAll ? "CheckedAllTrue" : ""}`}>
          <CRXCheckBox
            checked={isOverLayAllSelected}
            onChange={(e: any) => { onCheckedAll(e.target.checked) }}
            name="selectAll"
            selectedRow={isOverLayAllSelected}
            className="bucketListCheckedAll "
          />
          <span className="selectAllText">All Metadata Overlays</span>
        </MaterialMenuItem>
        <MaterialMenuItem className={`${CheckedTimestamp || CheckedAll ? "CheckedTimestampTrue" : ""}`}>
          <CRXCheckBox
            checked={overlayCheckedItems.some((x: any) => x == "Timestamp")}
            onChange={(e: any) => { e.target.checked ? setOverlayCheckedItems([...overlayCheckedItems, "Timestamp"]) : setOverlayCheckedItems(overlayCheckedItems.filter((x: any) => x !== "Timestamp")) }}
            name="Timestamp"
            selectedRow={overlayCheckedItems.some((x: any) => x == "Timestamp")}
            className="bucketListCheckedAll"
          />
          <span className="Timestamp">Time Stamp</span>
        </MaterialMenuItem>
        <MaterialMenuItem className={`${CheckedSensors || CheckedAll ? "CheckedSensorsTrue" : ""}`}>
          <CRXCheckBox
            checked={overlayCheckedItems.some((x: any) => x == "Sensors")}
            onChange={(e: any) => { e.target.checked ? setOverlayCheckedItems([...overlayCheckedItems, "Sensors"]) : setOverlayCheckedItems(overlayCheckedItems.filter((x: any) => x !== "Sensors")) }}
            selectedRow={overlayCheckedItems.some((x: any) => x == "Sensors")}
            name="Sensors"
            className="bucketListCheckedAll"
          />
          <span className="Sensors">Sensors</span>
        </MaterialMenuItem>
        {!isMultiViewEnable && <MaterialMenuItem className={`${CheckedGPS || CheckedAll ? "CheckedGPSTrue" : ""}`}>
          <CRXCheckBox
            checked={overlayCheckedItems.some((x: any) => x == "GPS (location + speed)")}
            selectedRow={overlayCheckedItems.some((x: any) => x == "GPS (location + speed)")}
            onChange={(e: any) => { e.target.checked ? setOverlayCheckedItems([...overlayCheckedItems, "GPS (location + speed)"]) : setOverlayCheckedItems(overlayCheckedItems.filter((x: any) => x !== "GPS (location + speed)")) }}
            name="GPS (location + speed)"
            className="bucketListCheckedAll"
          />

          <span className="GPS (location + speed)">GPS Coordinates</span>
        </MaterialMenuItem>}
        {!isMultiViewEnable && <MaterialMenuItem className={`${CheckedSpeed || CheckedAll ? "CheckedSpeedTrue" : ""}`}>
          <CRXCheckBox
            checked={overlayCheckedItems.some((x: any) => x == "Speed")}
            selectedRow={overlayCheckedItems.some((x: any) => x == "Speed")}
            onChange={(e: any) => { e.target.checked ? setOverlayCheckedItems([...overlayCheckedItems, "Speed"]) : setOverlayCheckedItems(overlayCheckedItems.filter((x: any) => x !== "Speed")) }}
            name="Speed"
            className="bucketListCheckedAll"
          />
          <span className="GPS (location + speed)">Speed</span>
        </MaterialMenuItem>}
        
      </MaterialMenu>
    </>
  )
}

export default VideoPlayerSettingMenu