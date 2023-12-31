import { CRXTooltip } from "@cb/shared";
import React, { useEffect } from "react";
import VideoPlayerBase from "../../../components/MediaPlayer/VideoPlayerBase";
import PDFViewer from "../../../components/MediaPlayer/PdfViewer/PDFViewer";
import { assetdata } from "./AssetDetailsTemplateModel";
import { useTranslation } from "react-i18next";
import ImageViewer from "../../../components/MediaPlayer/ImageViewer/ImageViewer";
import AssetsDisplayTabsHeaders from "./AssetsDisplayTabsHeaders";
import { enterPathActionCreator } from "../../../Redux/breadCrumbReducer";
import { useDispatch, useSelector } from "react-redux";
import DocViewer from "../../../components/MediaPlayer/DocsViewer/DocViewer";
import AudioPlayerBase from "../../../components/MediaPlayer/AudioPlayer/AudioPlayerBase";
import { urlList, urlNames } from "../../../utils/urlList";
import { setIsPrimaryAsset } from "../../../Redux/AssetDetailPrimaryBreadcrumbReducer";
import { Metadatainfo } from "../../../Redux/MetaDataInfoDetailReducer";
import { RootState } from "../../../Redux/rootReducer";

const AssetsDisplayTabs = (props: any) => {
  const dispatch = useDispatch();
  const { typeOfVideoAssetToInclude, typeOfAudioAssetToInclude, typeOfImageAssetToInclude, typeOfDocAssetToInclude, typeOfOtherAssetToInclude, detailContent, setDetailContent, formattedData, evidenceId, sensorsDataJson, updatePrimaryAsset, assetId, setIsAudioActive, assetTabContainer, masterAssetId, gpsSensorData, setAssetId } = props;
  
  let defaultTab = 0;
  const [block, setBlock] = React.useState(false);
  const metaData: Metadatainfo = useSelector(
    (state: RootState) => state.metadatainfoDetailReducer.metadataInfoState
  );
  
  useEffect(() => {
    defaultTab = typeOfDocAssetToInclude.includes(formattedData[0].files[0]?.typeOfAsset) ? 3 : defaultTab;
    defaultTab = typeOfVideoAssetToInclude.includes(formattedData[0].typeOfAsset) ? 1 : defaultTab;
    defaultTab = typeOfAudioAssetToInclude.includes(formattedData[0].typeOfAsset) ? 0 : defaultTab;
    defaultTab = typeOfImageAssetToInclude.includes(formattedData[0].typeOfAsset) ? 2 : defaultTab;
    defaultTab = typeOfOtherAssetToInclude.includes(formattedData[0].files[0]?.typeOfAsset) ? 4 : defaultTab;
    setTypeOfAssetCurrentTab1(defaultTab);
  }, [formattedData])
  const [typeOfAssetCurrentTab, setTypeOfAssetCurrentTab] = React.useState(defaultTab);
  const assetTabContainerRef : any = React.useRef(null)
  const setTypeOfAssetCurrentTab1 = (typeOfAssetCurrentTab1: number) => {
    let availableAssets = formattedData.filter((x: any) => x.status == "Available");
    let {videos, images, docs, audios, otherdocs} = dataOfCategories(availableAssets);
    if(typeOfAssetCurrentTab1 == 1){
      setAssetId(videos[0]?.id ?? assetId);
      if(videos[0]?.name){dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + videos[0]?.name }))};
      dispatch(setIsPrimaryAsset({isPrimaryAsset: videos[0]?.id == masterAssetId}));
    }
    else if(typeOfAssetCurrentTab1 == 0){
      setAssetId(audios[0]?.id ?? assetId);
      if(audios[0]?.id){dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + audios[0]?.name }))};
      dispatch(setIsPrimaryAsset({isPrimaryAsset: audios[0]?.id == masterAssetId}));
    }
    else if(typeOfAssetCurrentTab1 == 2){
      setAssetId(images[0]?.id ?? assetId);
      if(images[0]?.id){dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + images[0]?.name }))};
      dispatch(setIsPrimaryAsset({isPrimaryAsset: images[0]?.id == masterAssetId}));
    }
    else if(typeOfAssetCurrentTab1 == 3){
      setAssetId(docs[0]?.id ?? assetId);
      if(docs[0]?.id){dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + docs[0]?.name }))};
      dispatch(setIsPrimaryAsset({isPrimaryAsset: docs[0]?.id == masterAssetId}));
    }
    else if(typeOfAssetCurrentTab1 == 4){
      setAssetId(otherdocs[0]?.id ?? assetId);
      if(otherdocs[0]?.id){dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + otherdocs[0]?.name }))};
      dispatch(setIsPrimaryAsset({isPrimaryAsset: otherdocs[0]?.id == masterAssetId}));
    }
    setTypeOfAssetCurrentTab(typeOfAssetCurrentTab1);
  }


  const [apiKey, setApiKey] = React.useState<string>("");
  const { t } = useTranslation<string>();

  const typeOfAssetTabs = [
    { label: t("Audio"), index: 0 },
    { label: t("Videos"), index: 1 },
    { label: t("Images"), index: 2 },
    { label: t("Documents"), index: 3 },
    { label: t("Other"), index: 4 },
  ];

  const dataOfCategories = (availableAssets: assetdata[]) => {
    let videos = availableAssets.filter(x => typeOfVideoAssetToInclude.includes(x.typeOfAsset));
    let docs = availableAssets.filter((x: any) => x.typeOfAsset == "Doc" && typeOfDocAssetToInclude.includes(x.files[0]?.typeOfAsset));
    let images = availableAssets.filter((x: any) => typeOfImageAssetToInclude.includes(x.typeOfAsset));
    let audios = availableAssets.filter((x: any) => typeOfAudioAssetToInclude.includes(x.typeOfAsset));
    let otherdocs = availableAssets.filter((x: any) => typeOfOtherAssetToInclude.includes(x.files[0]?.typeOfAsset));
    return {videos, docs, images, audios, otherdocs}
  }


  useEffect(() => {
    setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? process.env.REACT_APP_GOOGLE_MAPS_API_KEY : "");
  }, [])


  const gotoSeeMoreView = (e: any, targetId: any) => {
    detailContent == false ? setDetailContent(true) : setDetailContent(false);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  useEffect(() => {
    if(block){
      setBlock(false)
    }
  }, [formattedData])


  useEffect(() => {
    
    let path = window.location.pathname;
    let htmlElement: any = document.querySelector("html");
    let pathBody = document.querySelector("body");
    if (path == urlList.filter((item: any) => item.name === urlNames.testVideoPlayer)[0].url) {
      pathBody?.classList.add("pathVideoPlayer");
      htmlElement.style.overflow = "hidden";
    } else if (path == urlList.filter((item: any) => item.name === urlNames.assetsDetail)[0].url) {
      pathBody?.classList.add("pathAssetDetail");
      htmlElement.style.overflow = "hidden";
    } else {
      pathBody?.classList.remove("pathVideoPlayer");
      pathBody?.classList.remove("pathAssetDetail");
      htmlElement.style.overflow = "auto";

    }
    assetTabContainer(assetTabContainerRef)
  },[])

//tab fun end
  const noAvailableAssetFound = () => {
    return <div className="_player_video_uploading">
      <div className="layout_inner_container">
        {metaData?.id && <div className="text_container_video">Evidence is not available!</div>}
        <div className="_empty_arrow_seeMore">
          {detailContent == false ?
            <button id="seeMoreButton" className="_empty_content_see_mot_btn seeMoreButton" onClick={(e: any) => gotoSeeMoreView(e, "detail_view")} data-target="#detail_view">
              <CRXTooltip iconName="fas fa-chevron-down" placement="bottom" arrow={false} title="see more" />
            </button>
            :
            <button id="lessMoreButton" data-target="#root" className="_empty_content_see_mot_btn lessMoreButton" onClick={(e: any) => gotoSeeMoreView(e, "root")}>
              <CRXTooltip iconName="fas fa-chevron-up" placement="bottom" arrow={false} title="see less" />
            </button>
          }
        </div>
      </div>
    </div>
  }
  
  const assetDisplay = (formattedData: assetdata[], evidenceId: any, gpsSensorData: any, sensorsDataJson: any, apiKey: any) => {
    let availableAssets = formattedData.filter((x: any) => x.status == "Available");
    let currentAssetAvailable = availableAssets?.some(x =>  x.id == assetId);
    let anyAssetAvialable = availableAssets.filter((x)=> x.files.some(y=> y.downloadUri.length > 0)).length > 0;
    if ((availableAssets.length > 0) && currentAssetAvailable && metaData.retention != "Expired" && anyAssetAvialable ) {
      let {videos, images, docs, audios, otherdocs} = dataOfCategories(availableAssets);
      
      
      
      return <>
        {/* New Tabs start */}
        <div  className="MainTabsPanel" ref={assetTabContainerRef}>
        <div className="tabsHeaderControl">
          {typeOfAssetTabs.map(x => 
          
            {
              let categoryAssets: assetdata[] = [];
              if(x.index == 0 && audios.length < 1){ return }
              categoryAssets = x.index == 1 ? videos : categoryAssets;
              categoryAssets = x.index == 2 ? images : categoryAssets;
              categoryAssets = x.index == 3 ? docs : categoryAssets;
              categoryAssets = x.index == 0 ? audios : categoryAssets;
              categoryAssets = x.index == 4 ? otherdocs : categoryAssets;
              categoryAssets = categoryAssets.filter((x:assetdata)=> x.evidenceId == evidenceId);
              return <AssetsDisplayTabsHeaders setTypeOfAssetCurrentTab={setTypeOfAssetCurrentTab1} typeOfAssetTab={x} updatePrimaryAsset={(id: any) => {setBlock(true); updatePrimaryAsset(id); setTimeout(() => {setBlock(false)}, 3000)}} availableAssets={availableAssets} categoryAssets={categoryAssets} isSelected={typeOfAssetCurrentTab == x.index} assetId={assetId}/> })}
        </div>
        <div className="tabsBodyControl">
        <div style={{display: typeOfAssetCurrentTab == 0 ? "block" : "none"}}>
            {audios.length > 0 && !block && <AudioPlayerBase data={audios} evidenceId={evidenceId}/>}
          </div>
          <div style={{display: typeOfAssetCurrentTab == 1 ? "block" : "none"}}>
            {videos.length > 0 && <VideoPlayerBase data={videos} evidenceId={evidenceId} sensorsDataJson={sensorsDataJson} apiKey={apiKey} guestView={false} setIsAudioActive={setIsAudioActive} gpsSensorData={gpsSensorData} />}
          </div>
          <div style={{display: typeOfAssetCurrentTab == 2 ? "block" : "none"}}>
            {images.length > 0 && <ImageViewer data={images} masterAssetId={masterAssetId} setAssetId={setAssetId} />}
          </div>
          <div style={{display: typeOfAssetCurrentTab == 3 ? "block" : "none"}}>
          {docs.length > 0 && <PDFViewer 
            data={docs}
            // updatePrimaryAsset={(id: any) => {setBlock(true); updatePrimaryAsset(id); setTimeout(() => {setBlock(false)}, 3000)}}
            setAssetId={setAssetId} />}
          </div>
          <div className="otherDoc" style={{display: typeOfAssetCurrentTab == 4 ? "flex" : "none"}}>
            {otherdocs.length > 0 && <DocViewer data={otherdocs[0]} />}
          </div>
      </div>{/* tabsBodyControl */}
    </div>{/* MainTabsPanel */}
  
        {/* New Tabs end */}

      </>
    }
    else { return <>{noAvailableAssetFound()}</> }
  }

  return <>{assetDisplay(formattedData, evidenceId, gpsSensorData, sensorsDataJson, apiKey)}</>
};

export default AssetsDisplayTabs;
