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
        <label className="tab">
          <input type="radio" name="entry-tabs" aria-label="Data Entry" defaultChecked />
          <svg className="size-4 me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M7 18v-3m5 3v-6m5 6V9m5 3c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464c.974.974 1.3 2.343 1.41 4.536"
            />
          </svg>
          Data Entry
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-2">
          <DataInput
            accountNames={accountNames}
            companyNames={companyNames}
            selectedRange={selectedRange}
            classifier={classifiers}
          />
        </div>
        <label className="tab">
          <input type="radio" name="entry-tabs" aria-label="Accounts Overview" />
          <svg className="size-4 me-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                d="M19 16c0 2.828 0 4.243-.879 5.121C17.243 22 15.828 22 13 22h-2c-2.828 0-4.243 0-5.121-.879C5 20.243 5 18.828 5 16v-4m0-4c0-2.828 0-4.243.879-5.121C6.757 2 8.172 2 11 2h2c2.828 0 4.243 0 5.121.879C19 3.757 19 5.172 19 8v4"
              />
              <path d="M5 4.076c-.975.096-1.631.313-2.121.803C2 5.757 2 7.172 2 10v4c0 2.828 0 4.243.879 5.121c.49.49 1.146.707 2.121.803M19 4.076c.975.096 1.631.313 2.121.803C22 5.757 22 7.172 22 10v4c0 2.828 0 4.243-.879 5.121c-.49.49-1.146.707-2.121.803" />
              <path strokeLinecap="round" d="M9 13h6M9 9h6m-6 8h3" />
            </g>
          </svg>
          Accounts Overview
        </label>
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <AccountOverview accountNames={allAccountNames} companyNames={allCompanyNames} combiMap={combiMap} />
        </div>
      </div>
    </div>
  );
};

export default App;
