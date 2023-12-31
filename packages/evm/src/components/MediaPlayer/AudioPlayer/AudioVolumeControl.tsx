import React, { useState, useRef } from "react";
import Slider from "@material-ui/core/Slider";
import "../VolumeControl.scss";
import { CRXTooltip, VolumeControlStyle } from "@cb/shared";

interface AudioVolumeControlProp {
  setVolumeHandle: (values: number) => void;
  setMuteHandle: (values: boolean) => void;
  volume: number;
  setVolume: any;
  setIsMute : any;
  isMute: boolean;
  handleVoumeClick: any;
  viewScreen: boolean
}

  const AudioVolumeControl = (props: AudioVolumeControlProp) => {

  const{setVolumeHandle, setMuteHandle, volume, setVolume, setIsMute, isMute, handleVoumeClick ,viewScreen} = props;

  const [volumeBar, setvolumeBar] = useState("hideVolumeBar");

  const VolumeControlCss = VolumeControlStyle();

  const handleVolumeChange = (event: any, value: any) => {

    setVolume(value);
    setVolumeHandle(value);
    if (volume == 0) {
      setIsMute(true);
      setMuteHandle(true);
    }
    else {
      setIsMute(false);
      setMuteHandle(false);
    }
  };

  const inputEl = useRef(null);

  const VolumeBarHover = () => {
    setvolumeBar("showVolumeBar");
  }

  const VolumeBarLeave = () => {
    setvolumeBar("hideVolumeBar");
  }

  const getVolumeIconClass = () => {

    if (isMute || volume == 0) {
      return "icon-volume-mute1";
    }
    else {
      if (volume >= 1 && volume <= 33) {
        return "icon-volume-low1";
      }
      else if (volume >= 34 && volume <= 66) {
        return "icon-volume-medium1";
      }
      else {
        return "icon-volume-high1";
      }
    }

  };

  return (
    <div id="volume-controls" onMouseLeave={VolumeBarLeave}>
      <div ref={inputEl} className={`volume-slider ${volumeBar} ${VolumeControlCss.main}`}>
        <Slider
          value={isMute ? 0 : volume}
          onChange={handleVolumeChange}
          aria-labelledby="input-slider"
          step={1}
          min={0}
          max={100}
          orientation="vertical"
          classes={{
            ...VolumeControlCss
          }}
        />
      </div>
      <div className="volume-icon">
        <span onMouseOver={VolumeBarHover} onClick={handleVoumeClick}>
          <CRXTooltip
            iconName={getVolumeIconClass()}
            placement="right-end"
            title={
              <>
                <p className="MuteTool MuteTool_1">{isMute ? "Unmute" : "Mute"} <span className={isMute ? "UnMuteSpacer" : "MuteSpacer"}>Shift + ALT + M</span></p>
                <p className="MuteTool MuteTool_2">Volume up <i className="fal fa-long-arrow-up"></i></p>
                <p className="MuteTool MuteTool_3">Volume down <i className="fal fa-long-arrow-down"></i></p>
              </>
            }
            arrow={false}
            className="VolumeBarHover"
            disablePortal={!viewScreen ? true : false}
          />
        </span>
      </div>
    </div>
  );
};

export default AudioVolumeControl;