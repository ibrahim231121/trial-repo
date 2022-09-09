import { Link } from "react-router-dom";

export default (text: string, classes: string | undefined, urlPathName: string) => {
  let idIndex = text.lastIndexOf("_");
  let Id = text.substring(idIndex + 1, text.length);
  return <Link to={urlPathName.substring(0, urlPathName.lastIndexOf('/'))  + "/" + Id} className={classes} >{text.substring(0, idIndex)}</Link>
};
