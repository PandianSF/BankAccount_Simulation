export interface IAccount {
  name: string;
  dob: string;
  gender: string;
  email: string;
  address: string;
  phoneNumber: string;
  kycDetails: IKyc;
  panNumber: string;
}

export interface IKyc {
  name: string;
  dob: string;
  email: string;
  phoneNumber: string;
  aadhardNumber: string;
  panNumber: string;
}

export interface IDeposit {
  amount: number;
  account_Id: string;
  name: string;
  phoneNumber: string;
}
