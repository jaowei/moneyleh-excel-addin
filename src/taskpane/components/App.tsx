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
  const [companyNames, setCompanyNames] = useState<any[]>([]);
  const [accountNames, setAccountNames] = useState<any[]>([]);
  const [combiMap, setCombiMap] = useState<Record<string, Set<string>>>();
  const styles = useStyles();

  React.useEffect(() => {
    const getCombinations = async () => {
      const companySet = new Set();
      const accountSet = new Set();
      const combiMap: Record<string, Set<string>> = {};
      const accountNames = await getColumnValues("Account");
      const companyNames = await getColumnValues("Company");
      for (let i = 0; i < accountNames.length; i++) {
        const companyName = companyNames[i][0];
        const accountName = accountNames[i][0];
        if (combiMap[companyName]) {
          combiMap[companyName].add(accountName);
        } else {
          combiMap[companyName] = new Set([accountName]);
        }
        companySet.add(companyName);
        accountSet.add(accountName);
      }
      setCompanyNames([...companySet] as any[]);
      setAccountNames([...accountSet] as any[]);
      setCombiMap(combiMap);
    };

    getCombinations();
  }, []);

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
          <AccountOverview accountNames={accountNames} companyNames={companyNames} combiMap={combiMap} />
        )}
      </div>
    </div>
  );
};

export default App;
