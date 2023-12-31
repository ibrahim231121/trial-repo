import { SetupConfigurationAgent } from './../utils/Api/ApiAgent';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CommonAgent, UnitsAndDevicesAgent } from '../utils/Api/ApiAgent';
import { Station } from '../utils/Api/models/StationModels';
import { MAX_REQUEST_SIZE_FOR} from '../utils/constant'
import { setLoaderValue } from './loaderSlice';

export const getStationsAsync: any = createAsyncThunk('getStationsInfo', async (pageiFilter: any, thunkAPI) => {
  let headers = [
    {   
        key : 'GridFilter', 
        value : JSON.stringify(pageiFilter.gridFilter)
    },
    {
        key: 'GridSort', 
        value : JSON.stringify(pageiFilter.gridSort)
    }, 
    {
        key: "InquireDepth", 
        value:"shallow"
    }]
  thunkAPI.dispatch(setLoaderValue({isLoading: true}))
  return await UnitsAndDevicesAgent.getAllStations(`?Page=${pageiFilter.page+1}&Size=${pageiFilter.size}`, headers)
    .then((response:any) => {
      thunkAPI.dispatch(setLoaderValue({isLoading: false, message: "" }))
      return response
    })
    .catch((error: any) => {
      thunkAPI.dispatch(setLoaderValue({isLoading: false, message: "", error: true }))
      console.error(error.response.data);
    });
});

export const getStationsInfoAllAsync: any = createAsyncThunk('getStationsInfoAll', async (_, thunkAPI) => {
  thunkAPI.dispatch(setLoaderValue({isLoading: true}))
  return await UnitsAndDevicesAgent.getAllStationInfo(`?Page=1&Size=${MAX_REQUEST_SIZE_FOR.STATION}`)
    .then((response:Station[]) => {
      thunkAPI.dispatch(setLoaderValue({isLoading: false, message: "" }))
      return response
    })
    .catch((error: any) => {
      thunkAPI.dispatch(setLoaderValue({isLoading: false, message: "", error: true }))
      console.error(error.response.data);
    });
});

export const getCountryRelatedStatesAsync: any = createAsyncThunk('getCountryStateAsync', async () => {
  return await CommonAgent.getCoutriesAlongWithStates()
    .then((response : any) => response)
    .catch((error: any) => {
        console.error(error.response.data);
    });
});

export const getRetentionStateAsync: any = createAsyncThunk('getRetentionStateAsync', async () => {
  return await SetupConfigurationAgent.getPoliciesAccordingToType(`/Policies/DataRetention?Page=1&Size=${MAX_REQUEST_SIZE_FOR.DATA_RETENTION}`)
    .then((response : any) => response)
    .catch((error: any) => {
        console.error(error.response.data);
    });
});

export const getUploadStateAsync: any = createAsyncThunk('getUploadStateAsync', async () => {
  return await SetupConfigurationAgent.getPoliciesAccordingToType(`/Policies/DataUpload?Page=1&Size=${MAX_REQUEST_SIZE_FOR.DATE_UPLOAD}`)
  .then((response : any) => response)
  .catch((error: any) => {
      console.error(error.response.data);
  });
});

export const stationsSlice = createSlice({
  name: 'station',
  initialState: { stationInfo: [], countryStates: [], retentionState: [], uploadState: [], stations: [] },
  reducers: {},

  extraReducers: {
    [getStationsInfoAllAsync.fulfilled]: (state, { payload }) => {
      state.stationInfo = payload;
    },
    [getStationsAsync.fulfilled]: (state, { payload }) => {
      state.stations = payload;
    },

    [getCountryRelatedStatesAsync.fulfilled]: (state, { payload }) => {
      state.countryStates = payload;
    },
    [getRetentionStateAsync.fulfilled]: (state, { payload }) => {
      state.retentionState = payload;
    },
    [getUploadStateAsync.fulfilled]: (state, { payload }) => {
      state.uploadState = payload;
    }
  }
});

export default stationsSlice;
