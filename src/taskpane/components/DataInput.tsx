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

const classifyRange = async (classifier: NaiveBayesClassifier, cellAddress: string) => {
  // if there is a value in the target cell do not override
  const targetCells = await getRangeValue(cellAddress);
  if (targetCells[0][0]) return;

  const detailsCell = "G" + cellAddress.slice(1);
  const details = await getRangeValue(detailsCell);
  const predictions: string[][] = [];
  details.forEach(async (detail) => {
    const prediction = await classifier.categorise(detail[0]);
    if (!prediction) return;
    predictions.push([prediction]);
  });

  await setRangeValue(cellAddress, predictions);
};

const preprocessRange = (range: string, classifers: Classifiers) => {
  const selectedRanges = range.split(",");
  return selectedRanges.forEach(async (range) => {
    // check is individual range is in the same column
    const cells = range.split(":");
    const firstColLetter = cells[0][0];
    let col: string | undefined = firstColLetter;
    for (let i = 0; i < cells.length; i++) {
      if (col !== cells[i][0]) {
        col = undefined;
        break;
      }
      col = cells[i][0];
    }

    // if not in the same column skip auto pop
    if (!col) return;
    switch (col[0]) {
      case "B":
        await classifyRange(classifers.tagsClassifier, range);
        break;
      case "H":
        await classifyRange(classifers.methodClassifier, range);
        break;
      case "I":
        await classifyRange(classifers.typesClassifier, range);
        break;
      default:
        break;
    }
  });
};

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

  const handlePopulateClick = async () => {
    const classifiers = props.classifier;
    if (!classifiers || !props.selectedRange) return;

    preprocessRange(props.selectedRange, classifiers);
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
          <Tag appearance="brand">{formatName ?? "No statement chosen"}</Tag>
        </Label>
      </Field>
      <Field label="Auto Populate Cell">
        <div className={styles.autoPop}>
          Selected:
          <Tag appearance="brand">{props.selectedRange}</Tag>
          <Button onClick={handlePopulateClick}>Populate</Button>
        </div>
      </Field>
    </div>
  );
};
