import * as React from "react";
import { makeStyles, SelectTabEventHandler, Tab, TabList, TabValue } from "@fluentui/react-components";
import { useState } from "react";
import { DataInput } from "./DataInput";
import { AccountOverview } from "./AccountOverview";
import { getColumnValues } from "../../lib/excel";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
});

const App: React.FC<AppProps> = () => {
  const [selectedPanel, setSelectedPanel] = useState<TabValue>("data-input");
  const [allCompanyNames, setAllCompanyNames] = useState<any[]>([]);
  const [allAccountNames, setAllAccountNames] = useState<any[]>([]);
  const styles = useStyles();

  React.useEffect(() => {
    const getCombinations = async () => {
      const accountNames = await getColumnValues("Account");
      const companyNames = await getColumnValues("Company");
      setAllCompanyNames(companyNames as any[]);
      setAllAccountNames(accountNames as any[]);
    };

    getCombinations();
  }, []);

  const { accountNames, companyNames, combiMap } = React.useMemo(() => {
    const companySet = new Set();
    const accountSet = new Set();
    const combiMap: Record<string, Set<string>> = {};
    for (let i = 0; i < allAccountNames.length; i++) {
      const companyName = allCompanyNames[i][0];
      const accountName = allAccountNames[i][0];
      if (combiMap[companyName]) {
        combiMap[companyName].add(accountName);
      } else {
        combiMap[companyName] = new Set([accountName]);
      }
      companySet.add(companyName);
      accountSet.add(accountName);
    }
    return {
      accountNames: [...accountSet],
      companyNames: [...companySet],
      combiMap,
    };
  }, [allAccountNames, allCompanyNames]);

  const handleTabSelect: SelectTabEventHandler = (_, data) => {
    setSelectedPanel(data.value);
  };

  return (
    <div className={styles.root}>
      <TabList selectedValue={selectedPanel} onTabSelect={handleTabSelect} size="small" appearance="subtle">
        <Tab id="data-input" value="data-input">
          Data Input
        </Tab>
        <Tab id="account-overview" value="account-overview">
          Account Overview
        </Tab>
      </TabList>
      <div>
        {selectedPanel === "data-input" && <DataInput accountNames={accountNames} companyNames={companyNames} />}
        {selectedPanel === "account-overview" && (
          <AccountOverview accountNames={allAccountNames} companyNames={allCompanyNames} combiMap={combiMap} />
        )}
      </div>
    </div>
  );
};

export default App;
