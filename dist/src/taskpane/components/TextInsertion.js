import * as React from "react";
import { useState } from "react";
import { Button, Field, Textarea, tokens, makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
    instructions: {
        fontWeight: tokens.fontWeightSemibold,
        marginTop: "20px",
        marginBottom: "10px",
    },
    textPromptAndInsertion: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    textAreaField: {
        marginLeft: "20px",
        marginTop: "30px",
        marginBottom: "20px",
        marginRight: "20px",
        maxWidth: "50%",
    },
});
const TextInsertion = (props) => {
    const [text, setText] = useState("Some text.");
    const handleTextInsertion = async () => {
        await props.insertText(text);
    };
    const handleTextChange = async (event) => {
        setText(event.target.value);
    };
    const styles = useStyles();
    return (React.createElement("div", { className: styles.textPromptAndInsertion },
        React.createElement(Field, { className: styles.textAreaField, size: "large", label: "Enter text to be inserted into the document." },
            React.createElement(Textarea, { size: "large", value: text, onChange: handleTextChange })),
        React.createElement(Field, { className: styles.instructions }, "Click the button to insert text."),
        React.createElement(Button, { appearance: "primary", disabled: false, size: "large", onClick: handleTextInsertion }, "Insert text")));
};
export default TextInsertion;
//# sourceMappingURL=TextInsertion.js.map