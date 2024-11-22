import * as React from "react";
import Header from "./Header";
import HeroList from "./HeroList";
import TextInsertion from "./TextInsertion";
import { makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { insertText } from "../taskpane";
const useStyles = makeStyles({
    root: {
        minHeight: "100vh",
    },
});
const App = (props) => {
    const styles = useStyles();
    // The list items are static and won't change at runtime,
    // so this should be an ordinary const, not a part of state.
    const listItems = [
        {
            icon: React.createElement(Ribbon24Regular, null),
            primaryText: "Achieve more with Office integration",
        },
        {
            icon: React.createElement(LockOpen24Regular, null),
            primaryText: "Unlock features and functionality",
        },
        {
            icon: React.createElement(DesignIdeas24Regular, null),
            primaryText: "Create and visualize like a pro",
        },
    ];
    return (React.createElement("div", { className: styles.root },
        React.createElement(Header, { logo: "assets/logo-filled.png", title: props.title, message: "Welcome" }),
        React.createElement(HeroList, { message: "Discover what this add-in can do for you today!", items: listItems }),
        React.createElement(TextInsertion, { insertText: insertText })));
};
export default App;
//# sourceMappingURL=App.js.map