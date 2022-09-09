import { ConfigurationTemplate, Unit } from "./UnitModels"
import { GeoLocation, History } from "./CommonModels"

export interface Station {
    id: number,
    name: string,
    address: Address,
    geoLocation: GeoLocation,
    units: Unit[],
    policies: StationPolicy[],
    history?: History,
    passcode: string,
    sSID: string,
    password?: string
}

export interface Address {
    street?: string,
    phone?: string
}

export interface StationPolicy {
    id?: number,
    retentionPolicyId: RetentionPolicyId,
    blackboxRetentionPolicyId: number,
    history?: History,
    configurationTemplates: ConfigurationTemplate[],
    uploadPolicyId: number
}

export interface CaptureDevice {
    id: number,
    name: string,
    deviceType: string
}

export interface RetentionPolicyId  {
    CMTFieldValue: number;
  };
