import { makeStyles, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { useEffect, useMemo, useState } from "react";
import { getColumnValues } from "../../lib/excel";
import { extendedDayjs } from "../../lib/utils/dayjs";

interface AccountOverviewProps {
  accountNames?: any[];
  companyNames?: any[];
  combiMap?: Record<string, Set<string>>;
}

interface AccountSummary {
  latestTransactionDate: string;
  totalValue: number;
}
interface CompanySummary {
  totalValue: number;
}

const useStyles = makeStyles({
  root: {
    height: "100%",
  },
});

const convertExcelDateToJS = (excelDate: number) => {
  return new Date(Math.round(excelDate - 25569) * 86400 * 1000);
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

  const accountSummary = useMemo(() => {
    const accountSummaryMap: Record<string, AccountSummary> = {};
    props?.accountNames?.forEach((account, idx) => {
      const currDate = extendedDayjs(convertExcelDateToJS(allDates[idx]));
      const currValue = parseFloat(allAmounts[idx]);
      if (accountSummaryMap[account]) {
        const existingDate = extendedDayjs(accountSummaryMap[account].latestTransactionDate, "DD/MM/YYYY");
        if (currDate.isAfter(existingDate)) {
          accountSummaryMap[account].latestTransactionDate = currDate.format("DD/MM/YYYY");
        }
        accountSummaryMap[account].totalValue += currValue;
      } else {
        accountSummaryMap[account] = {
          latestTransactionDate: currDate.format("DD/MM/YYYY"),
          totalValue: currValue,
        };
      }
    });
    return accountSummaryMap;
  }, [allDates]);

  const companySummary = useMemo(() => {
    const companySummaryMap: Record<string, CompanySummary> = {};
    if (props?.combiMap) {
      Object.entries(props.combiMap).forEach((data) => {
        const totalValue = Array.from(data[1]).reduce((prev, curr) => {
          return prev + accountSummary[curr].totalValue;
        }, 0);
        companySummaryMap[data[0]] = {
          totalValue,
        };
      });
    }
    return companySummaryMap;
  }, [props.combiMap]);

  if (!companyAccountCombination) {
    return <div>No accounts to view!</div>;
  }

  return (
    <Tree className={styles.root} size="small" aria-label="accounts">
      {Object.entries(companyAccountCombination).map((coyAndAccts) => (
        <TreeItem key={coyAndAccts[0]} itemType="branch">
          <TreeItemLayout>
            {coyAndAccts[0]} = ${companySummary[coyAndAccts[0]].totalValue}
          </TreeItemLayout>
          <Tree>
            {Array.from(coyAndAccts[1]).map((acctName) => (
              <TreeItem key={acctName} itemType="leaf">
                <TreeItemLayout>
                  {acctName}: {accountSummary[acctName]?.latestTransactionDate} = $
                  {accountSummary[acctName]?.totalValue}
                </TreeItemLayout>
              </TreeItem>
            ))}
          </Tree>
        </TreeItem>
      ))}
    </Tree>
  );
};
