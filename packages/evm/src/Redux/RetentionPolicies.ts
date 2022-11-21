import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SetupConfigurationAgent } from '../utils/Api/ApiAgent';

export const getAllRetentionPoliciesFilter: any = createAsyncThunk(
    'getAllFilterRetentionPolicies',
    async (pageiFilter?: any) => {
        let headers = [{key : 'GridFilter', value : JSON.stringify(pageiFilter.gridFilter)}]
        return await SetupConfigurationAgent.getAllFiltersRetentionPolicies(`?Page=${pageiFilter.page+1}&Size=${pageiFilter.size}`, headers)
        .then((response:any) => response)
        .catch((error: any) => {
            console.error(error.response.data);
        });
    }
);

export const retentionPoliciesSlice = createSlice({ 
    name: 'retentionPoliciesForm',
    initialState: { retentioPolicies: [], filterRetentionPolicies: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getAllRetentionPoliciesFilter.fulfilled, (state: any, {payload}) => {
            state.filterRetentionPolicies = payload;
        })
    }
});
export default retentionPoliciesSlice;