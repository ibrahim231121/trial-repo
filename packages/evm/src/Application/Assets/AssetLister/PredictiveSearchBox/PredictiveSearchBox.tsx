import React from 'react';
import "./PredictiveSearchBox.scss";
import { EditableSelect } from '@cb/shared'
import usePostFetch from "../../../../utils/Api/usePostFetch";
import { EVIDENCE_PREDITIVE_URL } from '../../../../utils/Api/url'
import { getToken, IDecoded } from "../../../../Login/API/auth";
import { useTranslation } from "react-i18next";
import { GenerateLockFilterQuery } from '../../utils/constants';
import jwt_decode from "jwt-decode";
import Cookies from 'universal-cookie';

interface Props {
  onSet: (e: any) => void;
  value: string;
  decoded: IDecoded;
  onKeyUp: (event: React.KeyboardEvent<HTMLImageElement>) => void;
}

const PredictiveSearchBox: React.FC<Props> = ({ children, onSet, value, decoded,onKeyUp }) => {
  const { t } = useTranslation<string>();
  const [showSearch, setShowSearch] = React.useState<any>(false);
  const [outCome, setOutCome] = React.useState<any>([]);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [methodFromHook, responseFromHook] = usePostFetch<any>(EVIDENCE_PREDITIVE_URL);
  const cookies = new Cookies();
  let decodedToken : IDecoded = jwt_decode(cookies.get("access_token"));

  React.useEffect(() => {
    if (responseFromHook) {
      setOutCome(responseFromHook);
      setShowSearch(true);
    }
  }, [responseFromHook]);

  const handleOnChange = async (e: any) => {
    if (e && e.target && e.target != null) {
      const { value } = e.target;
      if (value) {
        if (value && value.length >= 3 && !value.startsWith("#")) {
          fetchData(value);
        }
        if (value && value.length < 3) {
          setShowSearch(false);
          setOutCome([]);
        }
        onSet(value);
      } else {
        onSet("");
        setOutCome([]);
      }
    }
  };

  const getQuery = (searchVal: string) => {
    return {
      bool: {
        must: [
          {
            query_string: {
              query: `${searchVal}*`,
              fields: [
                "asset.assetName",
                "masterAsset.assetName",
                "categories",
                "cADId",
                "asset.unit",
                "asset.owners",
                "formData.key",
                "formData.value",
                "evidenceRelations.valueDisplayName"
              ],
            },
          },
          {
            bool: {
              should: [
                {
                  "match": {
                    "asset.owners": decodedToken.LoginId
                  },
                }
              ]
            }
          }
        ],
        filter: []
      },
    };
  };

  const fetchData = async (searchVal: string) => {
    /* Applying usePostFetch Hook*/
    let predictiveQuery : any = getQuery(searchVal);
    const lockQuery = GenerateLockFilterQuery(decoded);
    predictiveQuery.bool.filter = lockQuery;
    methodFromHook(predictiveQuery, {
      'Authorization': `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    });
  };

  const onChangeAutoComplete = (e: any, value: any) => {
    if (value && value != null) {
      setInputValue(value);
      onSet(value);
    }
    setShowSearch(false);
  }

  return (
    <div className="combo-box-Search">
      <i className="fal fa-search customIcon"></i>
      <EditableSelect
        id="combo-box-demo"
        options={outCome}
        placeHolder={t("Search_assets_by_ID#_case#_CAD#_categories_owners_etc")}
        onChange={onChangeAutoComplete}
        onInputChange={handleOnChange}
        clearText={() => setInputValue("")}
        value={value}
        onKeyUp = {onKeyUp}
        

      />
    </div>
  );
};

export default PredictiveSearchBox;
