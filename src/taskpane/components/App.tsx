import * as React from "react";
import { makeStyles, SelectTabEventHandler, Tab, TabList, TabValue } from "@fluentui/react-components";
import { useState } from "react";
import { DataInput } from "./DataInput";
import { AccountOverview } from "./AccountOverview";
import { getColumnValues, registerExcelHandlers } from "../../lib/excel";
import { NaiveBayesClassifier } from "../../lib/classifier/naive-bayes";
import { BookDatabaseFilled, PersonAccountsFilled } from "@fluentui/react-icons";

interface AppProps {
  title: string;
}

export interface Classifiers {
  methodClassifier: NaiveBayesClassifier;
  typesClassifier: NaiveBayesClassifier;
  tagsClassifier: NaiveBayesClassifier;
}

const useStyles = makeStyles({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
});

const initClassifier = async (categoryData: (string | number)[][], details: (string | number)[][]) => {
  const classifier = new NaiveBayesClassifier();
  for (let i = 0; i < categoryData.length; i++) {
    const category = categoryData[i][0];
    const detail = details[i][0];
    if (!category || !detail) continue;
    try {
      const checkedDetail = typeof detail !== "string" ? detail.toString() : detail;
      const checkedCategory = typeof category !== "string" ? category.toString() : category;
      await classifier.learn(checkedDetail, checkedCategory);
    } catch (error) {
      console.log(`Couldn't learn ${detail} for category ${category}`);
    }
  }
  return classifier;
};

const App: React.FC<AppProps> = () => {
  const [selectedPanel, setSelectedPanel] = useState<TabValue>("data-input");
  const [allCompanyNames, setAllCompanyNames] = useState<any[]>([]);
  const [allAccountNames, setAllAccountNames] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>();
  const [classifiers, setClassifiers] = useState<Classifiers>();
  const styles = useStyles();

  React.useEffect(() => {
    const initData = async () => {
      const accountNames = await getColumnValues("Account");
      const companyNames = await getColumnValues("Company");
      const transactionMethods = await getColumnValues("Transaction Method");
      const transactionType = await getColumnValues("Transaction Type");
      const tags = await getColumnValues("Type of entry");
      const details = await getColumnValues("Transaction Details");
      setAllCompanyNames(companyNames as any[]);
      setAllAccountNames(accountNames as any[]);
      const methodClassifier = await initClassifier(transactionMethods, details);
      const typesClassifier = await initClassifier(transactionType, details);
      const tagsClassifier = await initClassifier(tags, details);
      setClassifiers({
        methodClassifier,
        typesClassifier,
        tagsClassifier,
      });
    };

    async function handleChange(event: Excel.WorksheetSelectionChangedEventArgs) {
      await Excel.run(async (context) => {
        await context.sync();
        setSelectedRange(event.address);
      });
    }

    registerExcelHandlers(handleChange);
    initData();
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
        <Tab id="data-input" icon={<BookDatabaseFilled />} value="data-input">
          Data Input
        </Tab>
        <Tab id="account-overview" icon={<PersonAccountsFilled />} value="account-overview">
          Account Overview
        </Tab>
      </TabList>
      <div>
        {selectedPanel === "data-input" && (
          <DataInput
            accountNames={accountNames}
            companyNames={companyNames}
            selectedRange={selectedRange}
            classifier={classifiers}
          />
        )}
        {selectedPanel === "account-overview" && (
          <AccountOverview accountNames={allAccountNames} companyNames={allCompanyNames} combiMap={combiMap} />
        )}
      </div>
    </div>
  );
};

export default App;
