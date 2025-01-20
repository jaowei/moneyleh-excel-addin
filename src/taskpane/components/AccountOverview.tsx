import { makeStyles, Spinner, Tag, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
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
}

const useStyles = makeStyles({
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    gap: "10px",
    flexDirection: "column",
  },
  netWorth: {
    display: "flex",
    gap: "10px",
    paddingLeft: "10px",
  },
});

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
  <Tag key={valData[0]} size="extra-small" appearance="brand" shape="circular">
    {formatValue(valData[1], valData[0])}
  </Tag>
);

export const AccountOverview = (props: AccountOverviewProps) => {
  const [allDates, setAllDates] = useState<any[]>([]);
  const [allAmounts, setAllAmounts] = useState<any[]>([]);
  const [allCurrencies, setAllCurencies] = useState<any[]>([]);
  const styles = useStyles();

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

  const { companySummary, totalNetWorth } = useMemo(() => {
    const accountNames = props?.accountNames;
    const companyNames = props?.companyNames;
    const combiMap = props?.combiMap;
    const mainCurrency: string = "SGD";
    if (!accountNames || !combiMap || !companyNames || !allDates)
      return {
        companySummary: undefined,
      };
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
        sorted[val[0]] = val[1];
      });

    return {
      companySummary: sorted,
      totalNetWorth,
    };
  }, [allDates]);

  if (
    (props?.companyNames &&
      companySummary?.[props.companyNames[0]].totalValue &&
      !Object.values(companySummary?.[props.companyNames[0]].totalValue)[0]) ||
    !companySummary
  ) {
    return (
      <div className={styles.root}>
        <Spinner size="huge" label="Loading summary..." />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.netWorth}>
        <Tag appearance="outline">Total Net Worth:</Tag>
        {Object.entries(totalNetWorth).map((nwData) => (
          <Tag appearance="brand">{formatValue(nwData[1], nwData[0])}</Tag>
        ))}
      </div>
      <Tree size="small" aria-label="accounts">
        {Object.entries(companySummary).map((coyAndAccts) => {
          return (
            <TreeItem key={coyAndAccts[0]} itemType="branch">
              <TreeItemLayout>
                <Tag size="extra-small" appearance="outline">
                  {coyAndAccts[0]}
                </Tag>
                {Object.entries(coyAndAccts[1].totalValue).map((valData) => renderValueTag(valData))}
              </TreeItemLayout>
              <Tree>
                {Object.entries(coyAndAccts[1].accounts).map((acctData) => (
                  <TreeItem key={acctData[0]} itemType="leaf">
                    <TreeItemLayout>
                      <Tag size="extra-small" appearance="outline">
                        {acctData[0]}
                      </Tag>
                      <Tag size="extra-small" appearance="filled">
                        {acctData[1]?.latestTransactionDate}
                      </Tag>
                      {Object.entries(acctData[1]?.totalValue).map((valData) => renderValueTag(valData))}
                    </TreeItemLayout>
                  </TreeItem>
                ))}
              </Tree>
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
};
