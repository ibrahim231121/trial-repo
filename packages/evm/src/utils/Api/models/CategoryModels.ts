export interface Category {
    id: number,
    name: string,
    description: string,
    policies: Policies,
    forms: Forms[],
    history: History
}

export interface Policies {
    retentionPolicyId: number,
    uploadPolicyId: number
}

export interface Forms {
    id: number,
    name: string,
    description: string,
    type: string,
    fields: Field[],
    history: History
}

export interface Field {
    id: number,
    name: string,
    type: string,
    dependentField: number,
    display: Display
    history: History
}

export interface Display {
    Caption: string,
    Width: number,
    Order: number
}

export interface History {
    CreatedOn: string,
    ModifiedOn: string,
    Version: string
}