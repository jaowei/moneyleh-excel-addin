import * as React from "react";
import {
  Button,
  Combobox,
  ComboboxProps,
  Field,
  Input,
  Label,
  makeStyles,
  Tag,
  useComboboxFilter,
} from "@fluentui/react-components";
import { routeToParsers } from "../../lib/parsers/parser";
import { getRangeValue, insertRange, setRangeValue } from "../../lib/excel";
import { useState } from "react";
import { Transaction } from "../../lib/parsers/parser.types";
import { NaiveBayesClassifier } from "../../lib/classifier/naive-bayes";
import { Classifiers } from "./App";

const useStyles = makeStyles({
  root: {
    height: "100%",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  autoPop: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    alignItems: "center",
  },
});

interface DataInputProps {
  accountNames: any[];
  companyNames: any[];
  selectedRange: string | undefined;
  classifier: Classifiers | undefined;
}

const classifyRange = async (classifier: NaiveBayesClassifier, cellAddress: string, colLetter: string) => {
  const targetCells = await getRangeValue(cellAddress);
  const detailsCell = cellAddress.replaceAll(colLetter, "G");
  const details = await getRangeValue(detailsCell);
  const predictions: string[][] = [];
  const errors: string[] = [];
  details.forEach(async (detail, idx) => {
    const prediction = await classifier.categorise(detail[0]);
    if (!prediction) {
      errors.push(`No predictions for ${cellAddress}, item ${idx + 1}`);
      predictions.push([""]);
      return;
    }
    if (targetCells[idx][0]) {
      errors.push(`${cellAddress}, item ${idx + 1} is already filled, unable to override`);
      predictions.push([targetCells[idx][0]]);
      return;
    }
    predictions.push([prediction]);
  });

  await setRangeValue(cellAddress, predictions);
  return errors;
};

const preprocessRange = async (range: string, classifers: Classifiers) => {
  const selectedRanges = range.split(",");
  const errors: string[] = [];
  for (const range of selectedRanges) {
    const cells = range.split(":");
    const inSameColumn = cells.length === 1 || cells[0][0] === cells[1][0];

    if (!inSameColumn) {
      errors.push(`You have selected 2 different columns. Only selections in the same column are allowed`);
      continue;
    }
    switch (cells[0][0]) {
      case "B":
        errors.push(...(await classifyRange(classifers.tagsClassifier, range, "B")));
        break;
      case "H":
        errors.push(...(await classifyRange(classifers.methodClassifier, range, "H")));
        break;
      case "I":
        errors.push(...(await classifyRange(classifers.typesClassifier, range, "I")));
        break;
      default:
        errors.push(`Auto populate not allowed for column ${cells[0][0]}`);
    }
  }
  return errors;
};

export const DataInput = (props: DataInputProps) => {
  const [accountName, setAccountName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [formatName, setFormatName] = useState<string | undefined>("");
  const [password, setPassword] = useState<string>("");
  const [fileInputErrorState, setFileInputErrorState] = useState<"none" | "error" | "warning" | "success" | undefined>(
    "none"
  );
  const [autoPopErrorState, setAutoPopErrorState] = useState<"none" | "error" | "warning" | "success" | undefined>(
    "none"
  );
  const [fileInputErrorMsg, setFileInputErrorMsg] = useState<string>("");
  const [autoPopErrorMsg, setAutoPopErrorMsg] = useState<string>("");
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
      setFileInputErrorState("none");
      setFileInputErrorMsg("");
      const file = e.target.files?.[0];
      const result = await routeToParsers(file, accountName, companyName, password);
      const tempData = result?.rowData?.map((row: Transaction) => {
        return [...Object.values(row), `=TEXT([@Date], "yyyy-mm")`];
      });
      setFormatName(result?.formatName);
      insertRange(tempData);
    } catch (error: any) {
      setFileInputErrorState("error");
      if (error.name === "PasswordException") {
        setFileInputErrorMsg("File is password protected, please enter password!");
      } else {
        setFileInputErrorMsg(`Error: ${error.message}`);
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

  const handlePopulateClick = async () => {
    setAutoPopErrorState("none");
    setAutoPopErrorMsg("");
    const classifiers = props.classifier;
    if (!classifiers || !props.selectedRange) return;

    const errors = await preprocessRange(props.selectedRange, classifiers);
    if (errors.length) {
      setAutoPopErrorState("error");
      setAutoPopErrorMsg(errors.join(" ; "));
    }
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
      <Field label="Select file" required validationState={fileInputErrorState} validationMessage={fileInputErrorMsg}>
        <input type="file" onChange={handleFileInputChange}></input>
      </Field>
      <Field label="Detected statement format">
        <Label size="large" weight="semibold">
          <Tag appearance="brand">{formatName ?? "No statement chosen"}</Tag>
        </Label>
      </Field>
      <Field label="Auto Populate Cell" validationState={autoPopErrorState} validationMessage={autoPopErrorMsg}>
        <div className={styles.autoPop}>
          Selected:
          <Tag appearance="brand">{props.selectedRange}</Tag>
          <Button onClick={handlePopulateClick}>Populate</Button>
        </div>
      </Field>
    </div>
  );
};
