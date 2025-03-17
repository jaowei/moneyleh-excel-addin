import * as React from "react";
import { useState } from "react";
import { DataInput } from "./DataInput";
import { AccountOverview } from "./AccountOverview";
import { getColumnValues, registerExcelHandlers } from "../../lib/excel";
import { NaiveBayesClassifier } from "../../lib/classifier/naive-bayes";

export interface Classifiers {
  methodClassifier: NaiveBayesClassifier;
  typesClassifier: NaiveBayesClassifier;
  tagsClassifier: NaiveBayesClassifier;
}

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

const App: React.FC = () => {
  const [allCompanyNames, setAllCompanyNames] = useState<any[]>([]);
  const [allAccountNames, setAllAccountNames] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>();
  const [classifiers, setClassifiers] = useState<Classifiers>();

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

  return (
    <div className="bg-base-200">
      <div className="tabs tabs-lift">
        <input type="radio" name="entry-tabs" className="tab" aria-label="Data Entry" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-2">
          <DataInput
            accountNames={accountNames}
            companyNames={companyNames}
            selectedRange={selectedRange}
            classifier={classifiers}
          />
        </div>
        <input type="radio" name="entry-tabs" className="tab" aria-label="Accounts Overview" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <AccountOverview accountNames={allAccountNames} companyNames={allCompanyNames} combiMap={combiMap} />
        </div>
      </div>
    </div>
  );
};

export default App;
