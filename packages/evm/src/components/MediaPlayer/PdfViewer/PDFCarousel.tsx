import Carousel from "react-material-ui-carousel";
import './PDFCarousel.scss'
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { assetdata } from "../../../Application/Assets/Detail/AssetDetailsTemplateModel";
import { enterPathActionCreator } from "../../../Redux/breadCrumbReducer";

interface CarouselProps {
  mainSliderNodes: any[],
  indicatorSliderNodes: any[],
  data: assetdata[]
}

const PDFCarousel = ({ mainSliderNodes, indicatorSliderNodes, data }: CarouselProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation<string>();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const elementRef = useRef(null);

  return (
    <div className="banner_corusel banner_corusel_Document ">
      <div className="mainImage">
        <Carousel
          swipe={false}
          autoPlay={false}
          animation="slide"
          indicators={false}
          navButtonsAlwaysVisible={true}
          cycleNavigation={false}
          navButtonsProps={{
            style: {
              background: "rgba(48, 48, 48, 0.4)",
              color: "rgb(70, 67, 67)",
              borderRadius: 50,
              marginLeft: 0
            }
          }}
          className="carousel carousel_tabs"
          index={activeSlide}
          onChange={(now?: number, previous?: number) => {
            setActiveSlide(now ?? 0);
            dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + data[now ?? 0]?.name }));
          }}>
          {mainSliderNodes.map((item: any) => (
            <div className="main_silder_shop">{item}</div>
          ))}
        </Carousel>
      </div>
      <div id="slide" ref={elementRef}>
        {
          indicatorSliderNodes.map((item: any, index: number) => {
            return <div onClick={() => {
              setActiveSlide(index)
              dispatch(enterPathActionCreator({ val: t("Asset_Detail") + ": " + data[index]?.name }));
            }} className={index == activeSlide ? "activeSlider slider" : "slider"} >{item}</div>;
          })
        }
      </div>

    </div>
  );
}


export default PDFCarousel;
