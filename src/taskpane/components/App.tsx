import * as React from "react";
import { Field, Input, makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { routeToParsers } from "../../lib/parsers/parser";
import { HeroListItem } from "./HeroList";
import { insertRange } from "../../lib/excel";
import { useState } from "react";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const InputFormField = () => {};

const App: React.FC<AppProps> = (props: AppProps) => {
  const [accountName, setAccountName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const styles = useStyles();

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.currentTarget.value);
  };

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.currentTarget.value);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const rowData = await routeToParsers(file, accountName, companyName);
    const tempData = rowData.map((row: any) => {
      return [...Object.values(row), `=TEXT([@Date], "yyyy-mm")`];
    });
    insertRange(tempData);
  };

  const noParsingAllowed = !(accountName && companyName);

  return (
    <div className={styles.root}>
      <Field label="Company Name" required hint="Company name to be filled">
        <Input value={companyName} onChange={handleCompanyNameChange}></Input>
      </Field>
      <Field label="Account Name" required hint="Account name to be filled">
        <Input value={accountName} onChange={handleAccountNameChange}></Input>
      </Field>
      <Field label="Select file" required hint="Fill up company name and account name first">
        <input type="file" onChange={handleFileInputChange} disabled={noParsingAllowed}></input>
      </Field>
    </div>
  );
};

export default App;
