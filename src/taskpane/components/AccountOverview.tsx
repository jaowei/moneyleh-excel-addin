import { makeStyles, Tag, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { useEffect, useMemo, useState } from "react";
import { getColumnValues } from "../../lib/excel";
import { extendedDayjs } from "../../lib/utils/dayjs";

interface AccountOverviewProps {
  accountNames?: any[];
  companyNames?: any[];
  combiMap?: Record<string, Set<string>>;
}

interface AccountSummary {
  latestTransactionDate?: string;
  totalValue: number;
}
interface CompanySummary {
  totalValue: number;
  accounts: Record<string, AccountSummary>;
}

const useStyles = makeStyles({
  root: {
    height: "100%",
  },
});

const convertExcelDateToJS = (excelDate: number) => {
  return new Date(Math.round(excelDate - 25569) * 86400 * 1000);
};

const roundDecimals = (num: number) => {
  return Math.round(num * 100) / 100;
};

export const AccountOverview = (props: AccountOverviewProps) => {
  const companyAccountCombination = props?.combiMap;

  const [allDates, setAllDates] = useState<any[]>([]);
  const [allAmounts, setAllAmounts] = useState<any[]>([]);
  const styles = useStyles();

  useEffect(() => {
    const getLatestDate = async () => {
      const dates = await getColumnValues("Date");
      const amounts = await getColumnValues("Amount");
      setAllDates(dates);
      setAllAmounts(amounts);
    };

    getLatestDate();
  }, []);

  const { companySummary } = useMemo(() => {
    const accountNames = props?.accountNames;
    const companyNames = props?.companyNames;
    const combiMap = props?.combiMap;
    if (!accountNames || !combiMap || !companyNames) return {};
    const companySummaryMap: Record<string, CompanySummary> = {};

    Object.entries(combiMap).forEach((data) => {
      const accounts: Record<string, any> = {};
      Array.from(data[1]).forEach((accts) => {
        accounts[accts] = {
          totalValue: 0,
        };
      });
      companySummaryMap[data[0]] = {
        accounts,
        totalValue: 0,
      };
    });
    for (let i = 0; i < accountNames.length; i++) {
      const companyName = companyNames[i];
      const accountName = accountNames[i];
      const currDate = extendedDayjs(convertExcelDateToJS(allDates[i]));
      const currValue = parseFloat(allAmounts[i]);
      const existingDate = extendedDayjs(
        companySummaryMap[companyName].accounts[accountName].latestTransactionDate,
        "DD/MM/YYYY"
      );
      companySummaryMap[companyName].totalValue += currValue;
      companySummaryMap[companyName].accounts[accountName].totalValue += currValue;
      if (!existingDate.isValid() || (existingDate && currDate.isAfter(existingDate))) {
        companySummaryMap[companyName].accounts[accountName].latestTransactionDate = currDate.format("DD/MM/YYYY");
      }
    }

    return {
      companySummary: companySummaryMap,
    };
  }, [allDates]);

  if (!companyAccountCombination) {
    return <div>No accounts to view!</div>;
  }

  return (
    <Tree className={styles.root} size="small" aria-label="accounts">
      {Object.entries(companyAccountCombination).map((coyAndAccts) => {
        const companyData = companySummary?.[coyAndAccts[0]];
        if (!companyData) return <div />;
        return (
          <TreeItem key={coyAndAccts[0]} itemType="branch">
            <TreeItemLayout>
              <Tag size="extra-small" appearance="filled" shape="circular">
                {coyAndAccts[0]}
              </Tag>
              <Tag size="extra-small" appearance="brand" shape="circular">
                ${roundDecimals(companyData.totalValue)}
              </Tag>
            </TreeItemLayout>
            <Tree>
              {Object.entries(companyData.accounts).map((acctData) => (
                <TreeItem key={acctData[0]} itemType="leaf">
                  <TreeItemLayout>
                    <Tag size="extra-small" appearance="outline">
                      {acctData[0]}
                    </Tag>
                    <Tag size="extra-small" appearance="filled">
                      {acctData[1]?.latestTransactionDate}
                    </Tag>
                    <Tag size="extra-small" appearance="brand">
                      ${roundDecimals(acctData[1]?.totalValue)}
                    </Tag>
                  </TreeItemLayout>
                </TreeItem>
              ))}
            </Tree>
          </TreeItem>
        );
      })}
    </Tree>
  );
};
