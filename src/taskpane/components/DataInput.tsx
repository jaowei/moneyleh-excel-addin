import * as React from "react";
import { routeToParsers } from "../../lib/parsers/parser";
import { getRangeValue, insertRange, setRangeValue } from "../../lib/excel";
import { useState } from "react";
import { Transaction } from "../../lib/parsers/parser.types";
import { NaiveBayesClassifier } from "../../lib/classifier/naive-bayes";
import { Classifiers } from "./App";
import { Combobox } from "./Combobox";

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
  const [formatName, setFormatName] = useState<string | undefined>();
  const [password, setPassword] = useState<string>("");
  const [fileInputErrorMsg, setFileInputErrorMsg] = useState<string>("");
  const [autoPopErrorMsg, setAutoPopErrorMsg] = useState<string>("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setFileInputErrorMsg("");
      const file = e.target.files?.[0];
      const result = await routeToParsers(file, accountName, companyName, password);
      const tempData = result?.rowData?.map((row: Transaction) => {
        return [...Object.values(row), `=TEXT([@Date], "yyyy-mm")`];
      });
      setFormatName(result?.formatName);
      insertRange(tempData);
    } catch (error: any) {
      if (error.name === "PasswordException") {
        setFileInputErrorMsg("File is password protected, please enter password!");
      } else {
        setFileInputErrorMsg(`Error: ${error.message}`);
      }
      // clear the file from input
      e.target.value = "";
    }
  };

  const handlePopulateClick = async () => {
    setAutoPopErrorMsg("");
    const classifiers = props.classifier;
    if (!classifiers) {
      setAutoPopErrorMsg("Something has gone wrong! Please reach out for support!");
      return;
    }

    if (!props.selectedRange) {
      setAutoPopErrorMsg("Please select a cell first");
      return;
    }

    const errors = await preprocessRange(props.selectedRange, classifiers);
    if (errors.length) {
      setAutoPopErrorMsg(errors.join(" ; "));
    }
  };

  return (
    <div>
      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Select Company & Account Name</legend>
        <label className="fieldset-label">Company name to populate:</label>
        <Combobox
          options={props.companyNames}
          onOptionChange={(option) => {
            setCompanyName(option ?? "");
          }}
          placeholder="search companies"
        />
        <label className="fieldset-label">Account name to populate:</label>
        <Combobox
          options={props.accountNames}
          onOptionChange={(option) => {
            setAccountName(option ?? "");
          }}
          placeholder="search accounts"
        />
        <p className="fieldset-label">If adding a new company or account, simply type a new account or company name</p>
      </fieldset>

      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Select file</legend>
        <input
          type="file"
          className="file-input file-input-primary file-input-sm"
          onChange={handleFileInputChange}
        ></input>
        <p className="fieldset-label">{fileInputErrorMsg}</p>
        <label className="fieldset-label">File Password:</label>
        <label className="input validator input-sm">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
            </g>
          </svg>
          <input type="password" value={password} onChange={handlePasswordChange} placeholder="if any" />
        </label>
        <label className="fieldset-label">Format detected:</label>
        <div className="badge badge-accent">{formatName ?? "No statement chosen"}</div>
      </fieldset>

      <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Auto Populate Cells</legend>
        <label>Selected cells:</label>
        <div className="badge badge-neutral">{props.selectedRange}</div>
        <button className="btn btn-soft btn-sm" onClick={handlePopulateClick}>
          Populate
        </button>
        <p className="fieldset-label">{autoPopErrorMsg}</p>
      </fieldset>
    </div>
  );
};
