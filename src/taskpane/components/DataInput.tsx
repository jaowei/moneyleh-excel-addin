import * as React from "react";
import {
  Combobox,
  ComboboxProps,
  Field,
  Input,
  Label,
  makeStyles,
  useComboboxFilter,
} from "@fluentui/react-components";
import { routeToParsers } from "../../lib/parsers/parser";
import { getColumnValues, insertRange } from "../../lib/excel";
import { useState } from "react";
import { Transaction } from "../../lib/parsers/parser.types";

const useStyles = makeStyles({
  root: {
    height: "100%",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
});

interface DataInputProps {
  accountNames: any[];
  companyNames: any[];
}

export const DataInput = (props: DataInputProps) => {
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

  const companyComboboxChildren = useComboboxFilter(companyName, props.companyNames, {
    noOptionsMessage: "Couldn't find company!",
  });
  const accountComboboxChildren = useComboboxFilter(accountName, props.accountNames, {
    noOptionsMessage: "Couldn't find account!",
  });

  const onCompanyOptionSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    setCompanyName(data.optionText ?? "");
  };
  const onAccountOptionSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    setAccountName(data.optionText ?? "");
  };

  return (
    <div className={styles.root}>
      <Field label="Company Name" hint="Company name to be filled">
        <Combobox
          placeholder="type to search companies, leave text to fill new company"
          clearable
          freeform
          onOptionSelect={onCompanyOptionSelect}
          onChange={handleCompanyNameChange}
        >
          {companyComboboxChildren}
        </Combobox>
      </Field>
      <Field label="Account Name" hint="Account name to be filled">
        <Combobox
          placeholder="type to search accounts, leave text to fill new account"
          clearable
          freeform
          onOptionSelect={onAccountOptionSelect}
          onChange={handleAccountNameChange}
        >
          {accountComboboxChildren}
        </Combobox>
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
