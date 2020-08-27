
export interface Role {
    id: number;
    roleName: string;
    active: boolean;
  }
  
  export interface RoleSetup {
    id?: number;
    description: string;
    active: boolean;
    TenantId?: number;
    propertyId?: number;
    subPropertyId?: number;
    productId : number[];
  }