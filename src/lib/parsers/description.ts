import { TransactionMethods } from "./transactionMethods";
import { TransactionTypes } from "./transactionTypes";

const ERROR_VALUE = "";

type TransactionMap = {
  method?: string;
  type?: string;
};

// arrange from most generic to most specific terms
const methodMap: Record<string, TransactionMap> = {
  "i-bank": {
    method: TransactionMethods.transfer.name,
  },
  paynow: {
    method: TransactionMethods.paynow.name,
  },
  paylah: {
    method: TransactionMethods.paylah.name,
  },
  "bill ccc": {
    method: TransactionMethods.transfer.name,
  },
  ccc: {
    method: TransactionMethods.transfer.name,
  },
  dbsc: {
    method: TransactionMethods.transfer.name,
  },
  salary: {
    method: TransactionMethods.transfer.name,
    type: TransactionTypes.income,
  },
  " si ": { method: TransactionMethods.transfer.name }, // standing instruction
  "preferential rate based on total": {
    method: TransactionMethods.transfer.name,
    type: TransactionTypes.income,
  },
  "ntuc-mship fee": {
    method: TransactionMethods.cardOnline.name,
    type: TransactionTypes.wants,
  },
  spotify: {
    method: TransactionMethods.cardOnline.name,
    type: TransactionTypes.needs,
  },
  "gopay-gojek": {
    method: TransactionMethods.cardOnline.name,
    type: TransactionTypes.needs,
  },
  "grab*": {
    method: TransactionMethods.cardOnline.name,
    type: TransactionTypes.needs,
  },
  "shopee singapore mp": {
    method: TransactionMethods.cardOnline.name,
  },
  "amazon mktplc": {
    method: TransactionMethods.cardOnline.name,
  },
};

const typeMap: Record<string, TransactionMap> = {
  "bus/mrt": {
    type: TransactionTypes.needs,
  },
  giga: {
    type: TransactionTypes.needs,
  },
  "ezpaysgd*anytime": {
    type: TransactionTypes.needs,
  },
  causewaylink: {
    type: TransactionTypes.wants,
  },
  "diamond kitchen": {
    type: TransactionTypes.needs,
  },
  kopifellas: {
    type: TransactionTypes.wants,
  },
  "xiang xiang hunan": {
    type: TransactionTypes.wants,
  },
  kazuki: {
    type: TransactionTypes.needs,
  },
  "old chang kee": {
    type: TransactionTypes.wants,
  },
  "sheng siong": {
    type: TransactionTypes.needs,
  },
  "cold storage": {
    type: TransactionTypes.needs,
  },
  "venus beauty": {
    type: TransactionTypes.needs,
  },
};

/**
 * Parses financial transaction descriptions to transaction method and type
 * @param description
 */
export const descriptionToTags = (description: string) => {
  const desc = description.toLowerCase();

  let transactionMethod = "";
  let transactionType = "";

  const methodKeys = Object.keys(methodMap);
  const typeKeys = Object.keys(typeMap);

  const maxLen = Math.max(methodKeys.length, typeKeys.length);

  for (let i = 0; i < maxLen; i++) {
    const methodKeyword = methodKeys?.[i];
    const typeKeyword = typeKeys?.[i];
    if (methodKeyword && desc.includes(methodKeyword)) {
      transactionMethod = methodMap[methodKeyword]?.method || ERROR_VALUE;
      transactionType = methodMap[methodKeyword]?.type || ERROR_VALUE;
    }
    if (typeKeyword && desc.includes(typeKeyword)) {
      transactionType = typeMap[typeKeyword]?.type || ERROR_VALUE;
    }
  }
  return {
    transactionMethod,
    transactionType,
  };
};
