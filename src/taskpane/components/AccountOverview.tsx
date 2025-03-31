import { useEffect, useMemo, useState } from "react";
import { getColumnValues } from "../../lib/excel";
import { extendedDayjs } from "../../lib/utils/dayjs";

interface AccountOverviewProps {
  accountNames?: any[];
  companyNames?: any[];
  combiMap?: Record<string, Set<string>>;
}

interface TotalValueSummary {
  [key: string]: number;
}

interface AccountSummary {
  latestTransactionDate?: string;
  totalValue: TotalValueSummary;
}
interface CompanySummary {
  totalValue: TotalValueSummary;
  accounts: Record<string, AccountSummary>;
  fractionOfNetWorth: number;
}

const convertExcelDateToJS = (excelDate: number) => {
  return new Date(Math.round(excelDate - 25569) * 86400 * 1000);
};

const roundDecimals = (num: number) => {
  return Math.round(num * 100) / 100;
};

const formatValue = (num: number, currency: string) => {
  try {
    return new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency,
    }).format(roundDecimals(num));
  } catch (error) {
    return `${currency} ${roundDecimals(num)}`;
  }
};

const renderValueTag = (valData: [string, number]) => (
  <div key={valData[0]} className="badge badge-primary">
    {formatValue(valData[1], valData[0])}
  </div>
);

export const AccountOverview = (props: AccountOverviewProps) => {
  const [allDates, setAllDates] = useState<any[]>([]);
  const [allAmounts, setAllAmounts] = useState<any[]>([]);
  const [allCurrencies, setAllCurencies] = useState<any[]>([]);

  useEffect(() => {
    const getLatestDate = async () => {
      const dates = await getColumnValues("Date");
      const amounts = await getColumnValues("Amount");
      const currencies = await getColumnValues("Currency");
      setAllDates(dates);
      setAllAmounts(amounts);
      setAllCurencies(currencies);
    };

    getLatestDate();
  }, []);

  let companySummary;

  const accountNames = props?.accountNames;
  const companyNames = props?.companyNames;
  const combiMap = props?.combiMap;
  const mainCurrency: string = "SGD";
  if (!accountNames || !combiMap || !companyNames || !allDates) return <div>Unable to process accounts...</div>;

  const companySummaryMap: Record<string, CompanySummary> = {};
  const totalNetWorth: Record<string, number> = {};

  Object.entries(combiMap).forEach((data) => {
    const accounts: Record<string, any> = {};
    Array.from(data[1]).forEach((accts) => {
      accounts[accts] = {
        totalValue: {},
      };
    });
    companySummaryMap[data[0]] = {
      accounts,
      fractionOfNetWorth: 0,
      totalValue: {},
    };
  });
  for (let i = 0; i < accountNames.length; i++) {
    const companyName = companyNames[i];
    const accountName = accountNames[i];
    const currency = allCurrencies[i];
    const currDate = extendedDayjs(convertExcelDateToJS(allDates[i]));
    const currValue = parseFloat(allAmounts[i]);
    const existingDate = extendedDayjs(
      companySummaryMap[companyName].accounts[accountName].latestTransactionDate,
      "DD/MM/YYYY"
    );

    if (companySummaryMap[companyName].totalValue[currency] === undefined) {
      companySummaryMap[companyName].totalValue[currency] = currValue;
    } else {
      companySummaryMap[companyName].totalValue[currency] += currValue;
    }

    if (companySummaryMap[companyName].accounts[accountName].totalValue[currency] === undefined) {
      companySummaryMap[companyName].accounts[accountName].totalValue[currency] = currValue;
    } else {
      companySummaryMap[companyName].accounts[accountName].totalValue[currency] += currValue;
    }

    if (!existingDate.isValid() || (existingDate && currDate.isAfter(existingDate))) {
      companySummaryMap[companyName].accounts[accountName].latestTransactionDate = currDate.format("DD/MM/YYYY");
    }

    if (totalNetWorth[currency] === undefined) {
      totalNetWorth[currency] = currValue;
    } else {
      totalNetWorth[currency] += currValue;
    }
  }

  const sorted: Record<string, CompanySummary> = {};
  Object.entries(companySummaryMap)
    .sort((a, b) => b[1].totalValue[mainCurrency] - a[1].totalValue[mainCurrency])
    .forEach((val) => {
      const data = val[1];
      data.fractionOfNetWorth = roundDecimals(data.totalValue["SGD"] / totalNetWorth["SGD"]) * 100;
      sorted[val[0]] = data;
    });

  companySummary = sorted;

  if (
    (props?.companyNames &&
      companySummary?.[props.companyNames[0]]?.totalValue &&
      !Object.values(companySummary?.[props.companyNames[0]]?.totalValue)[0]) ||
    !companySummary
  ) {
    return (
      <div>
        <span className="loading loading-bars loading-xl"></span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 flex-col">
      <div className="stats shadow">
        {Object.entries(totalNetWorth).map((nwData) => (
          <div key={nwData[0]} className="stat">
            <div className="stat-title">Total Net Worth:</div>
            <div className="stat-value text-primary">{formatValue(nwData[1], nwData[0])}</div>
          </div>
        ))}
      </div>
      <div>
        {Object.entries(companySummary).map((coyAndAccts) => {
          return (
            <div key={coyAndAccts[0]} className="collapse collapse-arrow bg-base-300">
              <input type="checkbox"></input>
              <div className="collapse-title flex gap-2 items-center">
                <div className="badge badge-primary">{coyAndAccts[0]}</div>
                {Object.entries(coyAndAccts[1].totalValue).map((valData) => renderValueTag(valData))}
                <div className="badge badge-accent">{coyAndAccts[1].fractionOfNetWorth}%</div>
              </div>
              <div className="collapse-content bg-base-100">
                <ul className="list">
                  {Object.entries(coyAndAccts[1].accounts).map((acctData) => (
                    <li key={acctData[0]} className="list-row">
                      <div className="badge badge-secondary badge-soft">{acctData[0]}</div>
                      <div className="badge badge-secondary badge-soft">{acctData[1]?.latestTransactionDate}</div>
                      {Object.entries(acctData[1]?.totalValue).map((valData) => renderValueTag(valData))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
