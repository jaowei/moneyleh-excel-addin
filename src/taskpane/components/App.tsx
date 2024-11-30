import * as React from "react";
import { Field, Input, Label, makeStyles } from "@fluentui/react-components";
import { routeToParsers } from "../../lib/parsers/parser";
import { insertRange } from "../../lib/excel";
import { useState } from "react";
import { Transaction } from "../../lib/parsers/parser.types";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    height: "100%",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
});

const App: React.FC<AppProps> = () => {
  const [accountName, setAccountName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [formatName, setFormatName] = useState<string | undefined>("");
  const [password, setPassword] = useState<string>("");
  const [errorState, setErrorState] = useState<"none" | "error" | "warning" | "success" | undefined>("none");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const styles = useStyles();

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.currentTarget.value);
  };

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.currentTarget.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setErrorState("none");
      setErrorMsg("");
      const file = e.target.files?.[0];
      const result = await routeToParsers(file, accountName, companyName, password);
      const tempData = result?.rowData?.map((row: Transaction) => {
        return [...Object.values(row), `=TEXT([@Date], "yyyy-mm")`];
      });
      setFormatName(result?.formatName);
      insertRange(tempData);
    } catch (error: any) {
      setErrorState("error");
      if (error.name === "PasswordException") {
        setErrorMsg("File is password protected, please enter password!");
      } else {
        setErrorMsg(`Error: ${error.message}`);
      }
      // clear the file from input
      e.target.value = "";
    }
  };

  return (
    <div className={styles.root}>
      <Field label="Company Name" hint="Company name to be filled">
        <Input value={companyName} onChange={handleCompanyNameChange}></Input>
      </Field>
      <Field label="Account Name" hint="Account name to be filled">
        <Input value={accountName} onChange={handleAccountNameChange}></Input>
      </Field>
      <Field label="Password" hint="If the file has any password">
        <Input type="password" value={password} onChange={handlePasswordChange}></Input>
      </Field>
      <Field label="Select file" required validationState={errorState} validationMessage={errorMsg}>
        <input type="file" onChange={handleFileInputChange}></input>
      </Field>
      <Field label="Detected statement format">
        <Label size="large" weight="semibold">
          {formatName ?? "No statement chosen"}
        </Label>
      </Field>
    </div>
  );
};

export default App;
